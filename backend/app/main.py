from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import sqlite3
import os
from typing import Optional, List
import hashlib

app = FastAPI(title="Commercial Translation API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

DATABASE_PATH = "translation_app.db"

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TranslationRequest(BaseModel):
    platform: str
    chinese_text: str

class TranslationResponse(BaseModel):
    id: int
    platform: str
    chinese_text: str
    english_text: str
    cost: float
    created_at: str

class UserProfile(BaseModel):
    id: int
    email: str
    balance: float
    free_translations_used: int
    created_at: str

class TopUpRequest(BaseModel):
    amount: float
    payment_method: str

def init_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            balance DECIMAL(10,2) DEFAULT 0.00,
            free_translations_used INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS translations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            platform TEXT NOT NULL,
            chinese_text TEXT NOT NULL,
            english_text TEXT NOT NULL,
            cost DECIMAL(10,2) DEFAULT 1.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount DECIMAL(10,2) NOT NULL,
            transaction_type TEXT NOT NULL,
            payment_method TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return user

def mock_translate_chinese_to_english(chinese_text: str) -> str:
    translations = {
        "手机": "Mobile Phone",
        "电脑": "Computer",
        "耳机": "Headphones",
        "键盘": "Keyboard",
        "鼠标": "Mouse",
        "充电器": "Charger",
        "数据线": "Data Cable",
        "保护壳": "Protective Case",
        "屏幕保护膜": "Screen Protector",
        "蓝牙音箱": "Bluetooth Speaker",
        "智能手表": "Smart Watch",
        "平板电脑": "Tablet",
        "游戏手柄": "Game Controller",
        "摄像头": "Camera",
        "麦克风": "Microphone"
    }
    
    for chinese, english in translations.items():
        if chinese in chinese_text:
            return chinese_text.replace(chinese, english)
    
    return f"Translated: {chinese_text}"

@app.on_event("startup")
async def startup_event():
    init_database()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Commercial Translation API", "version": "1.0.0"}

@app.post("/api/auth/register")
def register_user(user: UserCreate):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT email FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    cursor.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        (user.email, hashed_password)
    )
    conn.commit()
    conn.close()
    
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login_user(user: UserLogin):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user or not verify_password(user.password, db_user[2]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/user/profile", response_model=UserProfile)
def get_user_profile(current_user = Depends(get_current_user)):
    return UserProfile(
        id=current_user[0],
        email=current_user[1],
        balance=float(current_user[3]),
        free_translations_used=current_user[4],
        created_at=current_user[5]
    )

@app.get("/api/user/balance")
def get_user_balance(current_user = Depends(get_current_user)):
    return {"balance": float(current_user[3])}

@app.post("/api/translate", response_model=TranslationResponse)
def translate_text(request: TranslationRequest, current_user = Depends(get_current_user)):
    user_id = current_user[0]
    free_translations_used = current_user[4]
    balance = float(current_user[3])
    
    cost = 0.0
    if free_translations_used >= 10:
        cost = 1.0
        if balance < cost:
            raise HTTPException(
                status_code=402, 
                detail="Insufficient balance. Please top up your account."
            )
    
    english_text = mock_translate_chinese_to_english(request.chinese_text)
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO translations (user_id, platform, chinese_text, english_text, cost) VALUES (?, ?, ?, ?, ?)",
        (user_id, request.platform, request.chinese_text, english_text, cost)
    )
    translation_id = cursor.lastrowid
    
    if cost > 0:
        new_balance = balance - cost
        cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
        cursor.execute(
            "INSERT INTO transactions (user_id, amount, transaction_type) VALUES (?, ?, ?)",
            (user_id, -cost, "translation")
        )
    else:
        cursor.execute(
            "UPDATE users SET free_translations_used = ? WHERE id = ?", 
            (free_translations_used + 1, user_id)
        )
    
    cursor.execute("SELECT created_at FROM translations WHERE id = ?", (translation_id,))
    created_at = cursor.fetchone()[0]
    
    conn.commit()
    conn.close()
    
    return TranslationResponse(
        id=translation_id,
        platform=request.platform,
        chinese_text=request.chinese_text,
        english_text=english_text,
        cost=cost,
        created_at=created_at
    )

@app.get("/api/translations/history", response_model=List[TranslationResponse])
def get_translation_history(current_user = Depends(get_current_user)):
    user_id = current_user[0]
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, platform, chinese_text, english_text, cost, created_at FROM translations WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    )
    translations = cursor.fetchall()
    conn.close()
    
    return [
        TranslationResponse(
            id=t[0],
            platform=t[1],
            chinese_text=t[2],
            english_text=t[3],
            cost=float(t[4]),
            created_at=t[5]
        )
        for t in translations
    ]

@app.post("/api/payment/topup")
def top_up_balance(request: TopUpRequest, current_user = Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    user_id = current_user[0]
    current_balance = float(current_user[3])
    new_balance = current_balance + request.amount
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))
    cursor.execute(
        "INSERT INTO transactions (user_id, amount, transaction_type, payment_method) VALUES (?, ?, ?, ?)",
        (user_id, request.amount, "topup", request.payment_method)
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Balance topped up successfully", "new_balance": new_balance}

# English Quest — Backend API

شركة أذكياء للبرمجيات | Azkia Software Company — Qatar

## Quick Start

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_content    # 20 categories × 3 levels = 240 items
python manage.py createsuperuser
python manage.py runserver
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | تسجيل والد جديد |
| POST | `/api/auth/login/` | تسجيل دخول (JWT) |
| POST | `/api/auth/refresh/` | تجديد التوكن |
| GET/PATCH | `/api/auth/profile/` | الملف الشخصي |
| GET/POST | `/api/children/` | قائمة/إضافة الأطفال |
| GET/PATCH/DELETE | `/api/children/<id>/` | تفاصيل الطفل |
| GET | `/api/dashboard/` | لوحة تحكم الوالد |
| GET | `/api/categories/` | كل الفئات التعليمية |
| GET | `/api/categories/<slug>/` | فئة مع كل عناصرها |
| POST | `/api/progress/submit/` | إرسال نتيجة لعبة |
| GET | `/api/progress/<child_id>/` | تقدم الطفل الكامل |
| GET | `/api/progress/<child_id>/leaderboard/` | لوحة المتصدرين |

## Tech Stack
- Django 5.x + DRF + SimpleJWT
- PostgreSQL (production) / SQLite (dev)
- PDPPL Article 17 compliant (children's data)

## Models (7)
Parent → Child → CategoryProgress, GameSession, DailyStreak
Category → LearningItem

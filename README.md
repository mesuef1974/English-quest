# 🚀 English Quest — رحلة تعلّم الإنجليزية

<div align="center">

**تطبيق تعليمي تفاعلي لتعليم الإنجليزية للأطفال الناطقين بالعربية**

🦜 مع شخصية **فصيح** — الببغاء الذكي الذي يتعلم مع طفلك!

[![Made in Qatar](https://img.shields.io/badge/Made_in-Qatar_🇶🇦-8A1538?style=for-the-badge)](https://github.com/mesuef1974/English-quest)
[![Django](https://img.shields.io/badge/Backend-Django_5-092E20?style=for-the-badge&logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

</div>

---

## 🎯 نظرة عامة

English Quest هو تطبيق تعليمي مصمم لتعليم اللغة الإنجليزية للأطفال العرب (6-12 سنة) عبر اللعب التفاعلي مع نطق صوتي ثنائي اللغة وتعزيز صوتي محفّز.

### ✨ المميزات الرئيسية

- 🦜 **شخصية فصيح** — ببغاء مرافق بـ 8 تعبيرات تفاعلية
- 📚 **20 فئة تعليمية** × 3 مستويات = **240+ عنصر تعليمي**
- 🎮 **4 أنماط لعب** — اختبار، توصيل، تهجئة، استمع واختر
- 🔊 **محرك نطق هجين** — Google TTS + Web Speech API
- 🎵 **تعزيز صوتي** — مؤثرات نجاح/خطأ مصممة للأطفال
- 👨‍👩‍👧 **لوحة تحكم للوالدين** — تقارير تقدم + تحديد وقت
- ⭐ **نظام نجوم وسلاسل يومية** — 180 نجمة كحد أقصى
- 🔐 **متوافق مع PDPPL** — قانون حماية بيانات الأطفال في قطر

---

## 📁 هيكل المشروع

```
English-quest/
├── 📄 docs/                         # الوثائق
│   └── English-Quest-PRD-v1.0.docx  # وثيقة متطلبات المنتج (12 قسم)
│
├── 🎨 frontend/                     # الواجهة الأمامية (React)
│   ├── prototype/                   # النسخة الأولى + النطق الصوتي
│   ├── v2/                          # النسخة الموسّعة (20 فئة + خريطة مراحل)
│   ├── brand/                       # دليل الهوية البصرية + فصيح
│   └── tts-lab/                     # مختبر جودة النطق العربي
│
├── ⚙️ backend/                      # الخادم (Django 5 + DRF)
│   ├── accounts/                    # تسجيل + أطفال + JWT
│   ├── learning/                    # فئات + عناصر تعليمية
│   ├── progress/                    # تقدم + جلسات + سلاسل
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## 🚀 التشغيل السريع

### Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_content    # 20 فئة × 3 مستويات = 240 عنصر
python manage.py createsuperuser
python manage.py runserver
```

**API Root:** `http://localhost:8000/api/`

### Frontend (React)

ملفات `.jsx` مصممة كـ Claude Artifacts — يمكن تشغيلها مباشرة في claude.ai أو داخل مشروع React/Vite:

```bash
npm create vite@latest frontend -- --template react
# انسخ ملفات .jsx إلى src/
```

---

## 📡 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| `POST` | `/api/auth/register/` | تسجيل والد جديد |
| `POST` | `/api/auth/login/` | دخول → JWT token |
| `POST` | `/api/auth/refresh/` | تجديد التوكن |
| `GET/PATCH` | `/api/auth/profile/` | الملف الشخصي |
| `GET/POST` | `/api/children/` | قائمة/إضافة الأطفال (حد 4) |
| `GET/PATCH/DELETE` | `/api/children/<id>/` | تفاصيل الطفل |
| `GET` | `/api/dashboard/` | لوحة تحكم الوالد |
| `GET` | `/api/categories/` | كل الفئات التعليمية |
| `GET` | `/api/categories/<slug>/` | فئة مع 3 مستويات |
| `POST` | `/api/progress/submit/` | ⭐ إرسال نتيجة لعبة |
| `GET` | `/api/progress/<child_id>/` | تقدم الطفل الكامل |
| `GET` | `/api/progress/<child_id>/leaderboard/` | لوحة المتصدرين |

---

## 📚 الفئات التعليمية (20)

| # | الفئة | الرمز | # | الفئة | الرمز |
|---|-------|-------|---|-------|-------|
| 1 | الحيوانات | 🦁 | 11 | الطقس | ⛅ |
| 2 | الطعام | 🍕 | 12 | الفواكه | 🍎 |
| 3 | الألوان | 🎨 | 13 | المركبات | 🚗 |
| 4 | الأرقام | 🔢 | 14 | المهن | 👨‍⚕️ |
| 5 | العائلة | 👨‍👩‍👧‍👦 | 15 | الأفعال | 🏃 |
| 6 | جسم الإنسان | 🧍 | 16 | المشاعر | 😊 |
| 7 | المدرسة | 🏫 | 17 | الأماكن | 🏪 |
| 8 | الطبيعة | 🌳 | 18 | الوقت | ⏰ |
| 9 | الملابس | 👕 | 19 | الرياضة | ⚽ |
| 10 | البيت | 🏠 | 20 | التحيات | 👋 |

**3 مستويات لكل فئة:**
- 🌱 **مبتدئ** — 6 كلمات مفردة
- 🌿 **متوسط** — 4 جمل قصيرة
- 🌳 **متقدم** — 2 جملة مركبة

---

## 🛠️ التقنيات

| الطبقة | التقنية |
|--------|---------|
| Frontend | React + Tailwind + Web Audio API |
| TTS Engine | Google Translate TTS + Web Speech API (Hybrid) |
| Backend | Django 5 + DRF + SimpleJWT |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Auth | JWT (7d access + 30d refresh) |

---

## 📋 خارطة الطريق

- [x] Prototype تفاعلي (6 فئات + 4 أنماط لعب)
- [x] نطق صوتي + تعزيز صوتي
- [x] محرك نطق هجين (Google TTS)
- [x] هوية بصرية + شخصية فصيح
- [x] توسيع المحتوى (20 فئة × 3 مستويات)
- [x] Backend Django + REST API
- [x] وثيقة PRD كاملة
- [ ] تحويل لـ PWA
- [ ] نظام اشتراك + بوابة دفع
- [ ] تطبيق React Native
- [ ] Speech Recognition
- [ ] دمج مع SchoolOS

---

## 👨‍💻 المطور

**سفيان** — معلم رياضيات + مطور برمجيات

شركة أذكياء للبرمجيات | Azkia Software Company

📍 قطر 🇶🇦

---

## 📜 الترخيص

جميع الحقوق محفوظة © 2026 شركة أذكياء للبرمجيات — قطر

---

> ⚠️ **هذا فرع التطوير (`develop`)** — للميزات الجديدة قيد العمل.
> للإصدار المستقر استخدم فرع `main`.

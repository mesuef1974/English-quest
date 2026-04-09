# 🤝 دليل المساهمة — English Quest

## استراتيجية الفروع (Git Flow)

```
main ──────────────────────────────────── Production (tagged releases)
  │
  └── develop ─────────────────────────── Integration branch
        │
        ├── feature/frontend-pwa ──────── ميزة جديدة
        ├── feature/payment-system ────── ميزة جديدة
        ├── feature/speech-recognition ── ميزة جديدة
        │
        ├── release/v1.0.0 ────────────── تحضير إصدار
        │
        └── hotfix/critical-fix ───────── إصلاح طارئ
```

## قواعد الفروع

### `main` — الإنتاج
- ❌ **لا يُدفع إليه مباشرة أبداً**
- ✅ يُدمج فيه فقط من `release/*` أو `hotfix/*`
- 🏷️ كل دمج = Git Tag بإصدار (v1.0.0, v1.1.0...)

### `develop` — التطوير
- فرع التكامل الرئيسي
- كل `feature/*` يُدمج هنا بعد المراجعة
- يجب أن يكون دائماً قابل للبناء

### `feature/*` — الميزات
- يُنشأ من: `develop`
- يُدمج في: `develop`
- التسمية: `feature/اسم-الميزة` (مثل `feature/frontend-pwa`)
- يُحذف بعد الدمج

### `release/*` — الإصدارات
- يُنشأ من: `develop`
- يُدمج في: `main` + `develop`
- التسمية: `release/v1.0.0`
- للاختبار النهائي وإصلاح bugs فقط

### `hotfix/*` — الإصلاحات الطارئة
- يُنشأ من: `main`
- يُدمج في: `main` + `develop`
- التسمية: `hotfix/وصف-المشكلة`

## تسمية الـ Commits

```
feat: إضافة ميزة جديدة
fix: إصلاح خطأ
docs: تحديث التوثيق
style: تنسيق الكود (لا يغير المنطق)
refactor: إعادة هيكلة
test: إضافة اختبارات
chore: مهام صيانة
perf: تحسين أداء
ci: تغييرات CI/CD
```

## مثال سير العمل

```bash
# 1. إنشاء ميزة جديدة
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. العمل والالتزام
git add .
git commit -m "feat: وصف الميزة"

# 3. دفع الفرع
git push origin feature/my-feature

# 4. إنشاء Pull Request → develop

# 5. بعد المراجعة والدمج، حذف الفرع
git branch -d feature/my-feature
```

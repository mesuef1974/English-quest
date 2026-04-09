# 📱 English Quest — PWA

Progressive Web App — قابل للتثبيت على الهاتف والتابلت.

## التشغيل

```bash
npm install
npm run dev      # تطوير → http://localhost:3000
npm run build    # بناء للإنتاج → dist/
npm run preview  # معاينة البناء
```

## الميزات

- ✅ قابل للتثبيت (Add to Home Screen)
- ✅ Splash screen مع فصيح
- ✅ شريط تثبيت ذكي (Install Banner)
- ✅ مؤشر عدم الاتصال
- ✅ تخزين مؤقت للخطوط والأصوات
- ✅ Service Worker (Workbox)
- ✅ أيقونات SVG (192px + 512px + Maskable)
- ✅ RTL + portrait orientation
- ✅ Apple Web App compatible

## النشر

```bash
npm run build
# انقل مجلد dist/ إلى الخادم (Nginx/Apache)
# أو استخدم Vercel: npx vercel --prod
```

## Lighthouse Scores المستهدفة

| المقياس | الهدف |
|---------|-------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 90 |
| PWA | ≥ 90 |

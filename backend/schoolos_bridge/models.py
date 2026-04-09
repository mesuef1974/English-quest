"""SchoolOS Bridge — SSO + Grade Sync + Teacher Dashboard"""
from django.db import models
from django.conf import settings

class SchoolOSConfig(models.Model):
    """ربط مدرسة مع SchoolOS"""
    school_name = models.CharField("اسم المدرسة", max_length=100)
    schoolos_api_url = models.URLField("رابط SchoolOS API")
    api_key = models.CharField("مفتاح API", max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "ربط SchoolOS"

    def __str__(self):
        return self.school_name

class TeacherAssignment(models.Model):
    """واجب من English Quest معيّن عبر SchoolOS"""
    schoolos_config = models.ForeignKey(SchoolOSConfig, on_delete=models.CASCADE)
    teacher_schoolos_id = models.CharField("معرّف المعلم في SchoolOS", max_length=50)
    category_slug = models.SlugField("الفئة")
    level = models.CharField("المستوى", max_length=2)
    due_date = models.DateTimeField("تاريخ التسليم")
    assigned_students = models.JSONField("الطلاب المعيّنين", default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "واجب"
        verbose_name_plural = "الواجبات"

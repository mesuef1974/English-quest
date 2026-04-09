"""
Seed 20 categories × 3 levels = 240+ learning items
python manage.py seed_content
"""
from django.core.management.base import BaseCommand
from learning.models import Category, LearningItem

CATEGORIES_DATA = [
    {"slug":"animals","na":"الحيوانات","ne":"Animals","em":"🦁","cl":"#FF6B35","free":True,
     "L1":[("Cat","قطة","🐱"),("Dog","كلب","🐕"),("Lion","أسد","🦁"),("Fish","سمكة","🐟"),("Bird","طائر","🐦"),("Rabbit","أرنب","🐇")],
     "L2":[("The cat is sleeping","القطة نائمة","🐱"),("The dog is running","الكلب يركض","🐕"),("The bird can fly","الطائر يستطيع الطيران","🐦"),("The fish is in the water","السمكة في الماء","🐟")],
     "L3":[("My favorite animal is the rabbit because it is cute","حيواني المفضل هو الأرنب لأنه لطيف","🐇"),("Lions live in Africa and they are very strong","الأسود تعيش في أفريقيا وهي قوية جداً","🦁")]},
    {"slug":"food","na":"الطعام","ne":"Food","em":"🍕","cl":"#E63946","free":True,
     "L1":[("Apple","تفاحة","🍎"),("Bread","خبز","🍞"),("Rice","أرز","🍚"),("Milk","حليب","🥛"),("Egg","بيضة","🥚"),("Cake","كعكة","🎂")],
     "L2":[("I like to eat rice","أحب أكل الأرز","🍚"),("The cake is sweet","الكعكة حلوة","🎂"),("I drink milk every day","أشرب الحليب كل يوم","🥛"),("Bread is on the table","الخبز على الطاولة","🍞")],
     "L3":[("For breakfast I eat eggs and drink milk","في الفطور آكل البيض وأشرب الحليب","🥚"),("My mother makes the best cake in the world","أمي تصنع أفضل كعكة في العالم","🎂")]},
    {"slug":"colors","na":"الألوان","ne":"Colors","em":"🎨","cl":"#7B2D8E","free":True,
     "L1":[("Red","أحمر","🔴"),("Blue","أزرق","🔵"),("Green","أخضر","🟢"),("Yellow","أصفر","🟡"),("White","أبيض","⚪"),("Black","أسود","⚫")],
     "L2":[("The sky is blue","السماء زرقاء","🔵"),("The grass is green","العشب أخضر","🟢"),("I like the red color","أحب اللون الأحمر","🔴"),("The sun is yellow","الشمس صفراء","🟡")],
     "L3":[("My favorite color is blue because it looks like the sea","لوني المفضل أزرق لأنه يشبه البحر","🔵"),("The rainbow has many beautiful colors","قوس المطر فيه ألوان جميلة كثيرة","🌈")]},
    {"slug":"numbers","na":"الأرقام","ne":"Numbers","em":"🔢","cl":"#0077B6",
     "L1":[("One","واحد","1️⃣"),("Two","اثنان","2️⃣"),("Three","ثلاثة","3️⃣"),("Five","خمسة","5️⃣"),("Ten","عشرة","🔟"),("Zero","صفر","0️⃣")],
     "L2":[("I have two hands","عندي يدان","✋"),("There are five fingers","يوجد خمسة أصابع","🖐️"),("I am ten years old","عمري عشر سنوات","🎂"),("One plus one is two","واحد زائد واحد يساوي اثنين","➕")],
     "L3":[("I can count from one to one hundred","أستطيع العد من واحد إلى مئة","💯"),("There are twelve months in one year","يوجد اثنا عشر شهراً في السنة","📅")]},
    {"slug":"family","na":"العائلة","ne":"Family","em":"👨‍👩‍👧‍👦","cl":"#E07A5F",
     "L1":[("Mother","أم","👩"),("Father","أب","👨"),("Sister","أخت","👧"),("Brother","أخ","👦"),("Baby","طفل","👶"),("Family","عائلة","👨‍👩‍👧‍👦")],
     "L2":[("I love my mother","أحب أمي","👩"),("My father is tall","أبي طويل","👨"),("My sister is kind","أختي لطيفة","👧"),("We are a happy family","نحن عائلة سعيدة","👨‍👩‍👧‍👦")],
     "L3":[("My family has five people","عائلتي فيها خمسة أشخاص","👨‍👩‍👧‍👦"),("Every Friday we visit my grandmother","كل جمعة نزور جدتي","👵")]},
    {"slug":"body","na":"جسم الإنسان","ne":"Body","em":"🧍","cl":"#2A9D8F",
     "L1":[("Head","رأس","🗣️"),("Hand","يد","✋"),("Eye","عين","👁️"),("Ear","أذن","👂"),("Foot","قدم","🦶"),("Mouth","فم","👄")],
     "L2":[("I see with my eyes","أرى بعيني","👁️"),("I hear with my ears","أسمع بأذني","👂"),("I have two hands","عندي يدان","✋"),("My head is big","رأسي كبير","🗣️")],
     "L3":[("We use our eyes to see and our ears to hear","نستخدم عيوننا للرؤية وآذاننا للسمع","👁️"),("The human body has many important parts","جسم الإنسان فيه أجزاء كثيرة مهمة","🧍")]},
    {"slug":"school","na":"المدرسة","ne":"School","em":"🏫","cl":"#264653",
     "L1":[("Book","كتاب","📖"),("Pen","قلم","🖊️"),("Teacher","معلم","👨‍🏫"),("Student","طالب","👨‍🎓"),("Bag","حقيبة","🎒"),("Desk","مكتب","🪑")],
     "L2":[("I go to school every day","أذهب إلى المدرسة كل يوم","🏫"),("The teacher is kind","المعلم لطيف","👨‍🏫"),("I read my book","أقرأ كتابي","📖"),("My bag is heavy","حقيبتي ثقيلة","🎒")],
     "L3":[("My favorite subject is English","مادتي المفضلة هي الإنجليزية","📖"),("The best teacher helps students learn with fun","أفضل معلم يساعد الطلاب على التعلم بالمرح","👨‍🏫")]},
    {"slug":"nature","na":"الطبيعة","ne":"Nature","em":"🌳","cl":"#386641",
     "L1":[("Sun","شمس","☀️"),("Moon","قمر","🌙"),("Star","نجمة","⭐"),("Tree","شجرة","🌳"),("Rain","مطر","🌧️"),("Sea","بحر","🌊")],
     "L2":[("The sun is very hot","الشمس حارة جداً","☀️"),("Stars shine at night","النجوم تلمع في الليل","⭐"),("I love the rain","أحب المطر","🌧️"),("The sea is beautiful","البحر جميل","🌊")],
     "L3":[("When it rains I can see a rainbow","عندما تمطر أستطيع رؤية قوس المطر","🌈"),("The moon and stars appear at night","القمر والنجوم يظهرون في الليل","🌙")]},
    {"slug":"clothes","na":"الملابس","ne":"Clothes","em":"👕","cl":"#BC4749",
     "L1":[("Shirt","قميص","👕"),("Pants","بنطال","👖"),("Shoes","حذاء","👟"),("Hat","قبعة","🧢"),("Dress","فستان","👗"),("Socks","جوارب","🧦")],
     "L2":[("I wear my shoes","ألبس حذائي","👟"),("The dress is pretty","الفستان جميل","👗"),("My hat is blue","قبعتي زرقاء","🧢"),("I need new pants","أحتاج بنطالاً جديداً","👖")],
     "L3":[("In winter I wear a jacket and in summer a shirt","في الشتاء ألبس جاكيت وفي الصيف قميص","🧥"),("My mother bought me new shoes","أمي اشترت لي حذاءً جديداً","👟")]},
    {"slug":"home","na":"البيت","ne":"Home","em":"🏠","cl":"#6D597A",
     "L1":[("Door","باب","🚪"),("Window","نافذة","🪟"),("Bed","سرير","🛏️"),("Chair","كرسي","🪑"),("Table","طاولة","🪑"),("Room","غرفة","🏠")],
     "L2":[("Open the door please","افتح الباب من فضلك","🚪"),("My bed is comfortable","سريري مريح","🛏️"),("Sit on the chair","اجلس على الكرسي","🪑"),("My room is clean","غرفتي نظيفة","🏠")],
     "L3":[("My house has three rooms a kitchen and a garden","بيتي فيه ثلاث غرف ومطبخ وحديقة","🏠"),("I help my mother clean the house","أساعد أمي في تنظيف البيت","🧹")]},
    {"slug":"weather","na":"الطقس","ne":"Weather","em":"⛅","cl":"#457B9D",
     "L1":[("Hot","حار","🔥"),("Cold","بارد","🥶"),("Wind","رياح","💨"),("Snow","ثلج","❄️"),("Cloud","سحابة","☁️"),("Rain","مطر","🌧️")],
     "L2":[("Today is very hot","اليوم حار جداً","🔥"),("It is raining outside","إنها تمطر في الخارج","🌧️"),("The wind is strong","الرياح قوية","💨"),("I like cold weather","أحب الطقس البارد","🥶")],
     "L3":[("In Qatar it is hot in summer and warm in winter","في قطر الجو حار في الصيف ودافئ في الشتاء","☀️"),("When it snows children play outside","عندما تثلج يلعب الأطفال في الخارج","⛄")]},
    {"slug":"fruits","na":"الفواكه","ne":"Fruits","em":"🍎","cl":"#D62828",
     "L1":[("Banana","موز","🍌"),("Orange","برتقال","🍊"),("Grape","عنب","🍇"),("Mango","مانجو","🥭"),("Lemon","ليمون","🍋"),("Melon","بطيخ","🍉")],
     "L2":[("Bananas are yellow","الموز أصفر","🍌"),("I eat fruit every day","آكل فاكهة كل يوم","🍎"),("Oranges have vitamin C","البرتقال فيه فيتامين سي","🍊"),("Grapes are sweet","العنب حلو","🍇")],
     "L3":[("My favorite fruit is mango because it is sweet","فاكهتي المفضلة المانجو لأنها حلوة","🥭"),("Eating fruits keeps us healthy","أكل الفواكه يبقينا أصحاء","💪")]},
    {"slug":"vehicles","na":"المركبات","ne":"Vehicles","em":"🚗","cl":"#3D5A80",
     "L1":[("Car","سيارة","🚗"),("Bus","حافلة","🚌"),("Plane","طائرة","✈️"),("Boat","قارب","🚤"),("Train","قطار","🚂"),("Bike","دراجة","🚲")],
     "L2":[("The car is fast","السيارة سريعة","🚗"),("I ride the bus to school","أركب الحافلة إلى المدرسة","🚌"),("Planes fly in the sky","الطائرات تطير في السماء","✈️"),("I like riding my bike","أحب ركوب دراجتي","🚲")],
     "L3":[("My father drives us to school every morning","أبي يوصلنا إلى المدرسة كل صباح","🚗"),("One day I want to travel by plane","يوماً ما أريد السفر بالطائرة","✈️")]},
    {"slug":"jobs","na":"المهن","ne":"Jobs","em":"👨‍⚕️","cl":"#5F0F40",
     "L1":[("Doctor","طبيب","👨‍⚕️"),("Police","شرطي","👮"),("Farmer","مزارع","👨‍🌾"),("Cook","طباخ","👨‍🍳"),("Pilot","طيار","👨‍✈️"),("Nurse","ممرض","👨‍⚕️")],
     "L2":[("The doctor helps sick people","الطبيب يساعد المرضى","👨‍⚕️"),("The farmer grows food","المزارع يزرع الطعام","👨‍🌾"),("I want to be a pilot","أريد أن أكون طياراً","👨‍✈️"),("The cook makes food","الطباخ يصنع الطعام","👨‍🍳")],
     "L3":[("When I grow up I want to be a doctor","عندما أكبر أريد أن أكون طبيباً","👨‍⚕️"),("Every job is important","كل مهنة مهمة لأننا نحتاج بعضنا","🤝")]},
    {"slug":"actions","na":"الأفعال","ne":"Actions","em":"🏃","cl":"#FB8500",
     "L1":[("Run","يركض","🏃"),("Jump","يقفز","🤸"),("Eat","يأكل","🍽️"),("Sleep","ينام","😴"),("Read","يقرأ","📖"),("Play","يلعب","⚽")],
     "L2":[("I run every morning","أركض كل صباح","🏃"),("Children love to play","الأطفال يحبون اللعب","⚽"),("I read before I sleep","أقرأ قبل أن أنام","📖"),("We eat together","نأكل معاً","🍽️")],
     "L3":[("Every day I wake up eat breakfast and go to school","كل يوم أستيقظ وأفطر وأذهب إلى المدرسة","🌅"),("After school I play then read my favorite book","بعد المدرسة ألعب ثم أقرأ كتابي المفضل","📖")]},
    {"slug":"feelings","na":"المشاعر","ne":"Feelings","em":"😊","cl":"#F72585",
     "L1":[("Happy","سعيد","😊"),("Sad","حزين","😢"),("Angry","غاضب","😠"),("Scared","خائف","😨"),("Tired","متعب","😴"),("Brave","شجاع","💪")],
     "L2":[("I am very happy today","أنا سعيد جداً اليوم","😊"),("Do not be scared","لا تكن خائفاً","😨"),("My friend is brave","صديقي شجاع","💪"),("I am tired after playing","أنا متعب بعد اللعب","😴")],
     "L3":[("When I help others I feel happy","عندما أساعد الآخرين أشعر بالسعادة","😊"),("It is okay to feel sad sometimes","لا بأس أن نشعر بالحزن أحياناً","💙")]},
    {"slug":"places","na":"الأماكن","ne":"Places","em":"🏪","cl":"#606C38",
     "L1":[("Park","حديقة","🏞️"),("Shop","متجر","🏪"),("Beach","شاطئ","🏖️"),("Hospital","مستشفى","🏥"),("Library","مكتبة","📚"),("Mosque","مسجد","🕌")],
     "L2":[("I play in the park","ألعب في الحديقة","🏞️"),("We go to the beach","نذهب إلى الشاطئ","🏖️"),("The library has many books","المكتبة فيها كتب كثيرة","📚"),("We pray in the mosque","نصلي في المسجد","🕌")],
     "L3":[("On Friday we go to the mosque then the park","يوم الجمعة نذهب إلى المسجد ثم الحديقة","🕌"),("The library is my favorite place","المكتبة مكاني المفضل","📚")]},
    {"slug":"time","na":"الوقت","ne":"Time","em":"⏰","cl":"#9B5DE5",
     "L1":[("Morning","صباح","🌅"),("Night","ليل","🌙"),("Today","اليوم","📅"),("Monday","الاثنين","1️⃣"),("Friday","الجمعة","🕌"),("Hour","ساعة","⏰")],
     "L2":[("Good morning","صباح الخير","🌅"),("It is night time","حان وقت الليل","🌙"),("Today is Friday","اليوم الجمعة","🕌"),("What time is it","كم الساعة","⏰")],
     "L3":[("I wake up at six and sleep at nine","أستيقظ الساعة السادسة وأنام التاسعة","⏰"),("There are seven days in a week","في الأسبوع سبعة أيام","📅")]},
    {"slug":"sports","na":"الرياضة","ne":"Sports","em":"⚽","cl":"#00A896",
     "L1":[("Ball","كرة","⚽"),("Swim","يسبح","🏊"),("Race","سباق","🏁"),("Goal","هدف","🥅"),("Team","فريق","👥"),("Win","يفوز","🏆")],
     "L2":[("I play with the ball","ألعب بالكرة","⚽"),("I can swim fast","أستطيع السباحة بسرعة","🏊"),("Our team will win","فريقنا سيفوز","🏆"),("I scored a goal","سجلت هدفاً","🥅")],
     "L3":[("Sports keep our body healthy","الرياضة تحافظ على صحة جسمنا","💪"),("My favorite sport is swimming","رياضتي المفضلة السباحة","🏊")]},
    {"slug":"greetings","na":"التحيات","ne":"Greetings","em":"👋","cl":"#EE6C4D","free":True,
     "L1":[("Hello","مرحباً","👋"),("Goodbye","مع السلامة","👋"),("Please","من فضلك","🙏"),("Thanks","شكراً","🙏"),("Sorry","آسف","😔"),("Yes","نعم","✅")],
     "L2":[("Hello how are you","مرحباً كيف حالك","👋"),("Thank you very much","شكراً جزيلاً","🙏"),("I am sorry","أنا آسف","😔"),("See you tomorrow","أراك غداً","👋")],
     "L3":[("When I meet someone new I say hello","عندما أقابل شخصاً جديداً أقول مرحباً","👋"),("We should always say please and thank you","يجب أن نقول من فضلك وشكراً دائماً","🙏")]},
]


class Command(BaseCommand):
    help = "Seed 20 categories with 3 levels each (240+ items)"

    def handle(self, *args, **options):
        created_cats = 0
        created_items = 0

        for i, cat_data in enumerate(CATEGORIES_DATA):
            cat, created = Category.objects.update_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name_ar": cat_data["na"], "name_en": cat_data["ne"],
                    "emoji": cat_data["em"], "color": cat_data["cl"],
                    "order": i, "is_free": cat_data.get("free", False),
                }
            )
            if created:
                created_cats += 1

            for level in ["L1", "L2", "L3"]:
                for j, item in enumerate(cat_data.get(level, [])):
                    _, item_created = LearningItem.objects.update_or_create(
                        category=cat, level=level, text_en=item[0],
                        defaults={"text_ar": item[1], "emoji": item[2], "order": j}
                    )
                    if item_created:
                        created_items += 1

        total_cats = Category.objects.count()
        total_items = LearningItem.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"✅ Seeded: {total_cats} categories, {total_items} items "
            f"(new: {created_cats} cats, {created_items} items)"
        ))

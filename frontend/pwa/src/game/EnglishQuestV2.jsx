import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════ AUDIO ═══════ */
let _ctx=null;
function getCtx(){if(!_ctx)_ctx=new(window.AudioContext||window.webkitAudioContext)();if(_ctx.state==="suspended")_ctx.resume();return _ctx;}
function playTone(f,d,t="sine",v=.3,dl=0){const c=getCtx(),o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime+dl);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dl+d);o.connect(g);g.connect(c.destination);o.start(c.currentTime+dl);o.stop(c.currentTime+dl+d);}
function sfxCorrect(){playTone(523,.12,"sine",.25,0);playTone(659,.12,"sine",.25,.1);playTone(784,.18,"sine",.3,.2);playTone(1047,.25,"sine",.2,.3);}
function sfxWrong(){playTone(350,.15,"square",.12,0);playTone(280,.2,"square",.1,.12);}
function sfxStar(){playTone(880,.08,"sine",.2,0);playTone(1318,.08,"sine",.2,.14);playTone(1760,.15,"sine",.25,.21);}
function sfxVictory(){playTone(523,.15,"sine",.2,0);playTone(659,.15,"sine",.2,.15);playTone(784,.15,"sine",.2,.3);playTone(1047,.3,"sine",.3,.45);playTone(1047,.4,"sine",.3,.75);}
function sfxTap(){playTone(600,.04,"sine",.1,0);}
function sfxLevelUp(){playTone(440,.1,"sine",.2,0);playTone(554,.1,"sine",.2,.1);playTone(659,.1,"sine",.2,.2);playTone(880,.2,"sine",.3,.3);playTone(1108,.3,"sine",.25,.45);}

/* ═══════ SPEECH ═══════ */
function speak(t,l="en-US",r=.85){return new Promise(res=>{if(!window.speechSynthesis){res();return;}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=l;u.rate=r;u.pitch=l==="ar-SA"?1:1.05;u.volume=1;const vs=window.speechSynthesis.getVoices();const v=vs.find(v=>v.lang.startsWith(l.split("-")[0])&&v.localService)||vs.find(v=>v.lang.startsWith(l.split("-")[0]));if(v)u.voice=v;u.onend=res;u.onerror=res;window.speechSynthesis.speak(u);});}
function speakEn(t){return speak(t,"en-US",.82);}
function speakAr(t){return speak(t,"ar-SA",.85);}
async function speakBoth(a,e){await speakAr(a);await new Promise(r=>setTimeout(r,350));await speakEn(e);}

/* ═══════ FASEEH MINI ═══════ */
function Faseeh({expr="happy",size=80}){
  const open=expr==="speaking"||expr==="celebrating";
  return <svg viewBox="0 0 100 130" width={size} height={size*1.3}><ellipse cx="50" cy="115" rx="14" ry="12" fill="#1B998B" opacity=".8"/><ellipse cx="50" cy="85" rx="26" ry="32" fill="#2EC4B6"/><ellipse cx="50" cy="89" rx="19" ry="24" fill="#CBF3F0"/>
  <circle cx="50" cy="40" r="24" fill="#2EC4B6"/><circle cx="50" cy="42" r="18" fill="#CBF3F0" opacity=".5"/>
  <ellipse cx="44" cy="18" rx="3" ry="8" fill="#FF6B35" transform="rotate(-15 44 18)"/><ellipse cx="50" cy="16" rx="2.5" ry="9" fill="#FFBE0B"/><ellipse cx="56" cy="18" rx="3" ry="8" fill="#FF6B35" transform="rotate(15 56 18)"/>
  <circle cx="40" cy="37" r="7" fill="white"/><circle cx="60" cy="37" r="7" fill="white"/>
  {expr!=="sleeping"?<><circle cx="41" cy="36.5" r="3.5" fill="#1A1A2E"/><circle cx="59" cy="36.5" r="3.5" fill="#1A1A2E"/><circle cx="42" cy="35.5" r="1.2" fill="white"/><circle cx="60" cy="35.5" r="1.2" fill="white"/></>:<><line x1="36" y1="37" x2="44" y2="37" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/><line x1="56" y1="37" x2="64" y2="37" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/></>}
  {(expr==="happy"||expr==="celebrating")&&<><circle cx="34" cy="44" r="4" fill="#FF9F9F" opacity=".3"/><circle cx="66" cy="44" r="4" fill="#FF9F9F" opacity=".3"/></>}
  <path d={open?"M45 45 Q50 42 55 45 Q52 50 50 52 Q48 50 45 45Z":"M45 44 Q50 41 55 44 Q50 48 45 44Z"} fill="#FFBE0B" stroke="#E6A800" strokeWidth=".5"/>
  {expr==="celebrating"&&<><text x="15" y="15" fontSize="8">✨</text><text x="78" y="12" fontSize="7">⭐</text></>}
  {expr==="sleeping"&&<><text x="65" y="25" fontSize="7" fill="#2EC4B6" fontWeight="700">z</text><text x="73" y="18" fontSize="9" fill="#2EC4B6" fontWeight="700">Z</text></>}
  </svg>;
}

/* ═══════ 20 CATEGORIES × 3 LEVELS ═══════ */
const CATS = [
  { id:"animals",na:"الحيوانات",ne:"Animals",em:"🦁",cl:"#FF6B35",
    L1:[{en:"Cat",ar:"قطة",em:"🐱"},{en:"Dog",ar:"كلب",em:"🐕"},{en:"Lion",ar:"أسد",em:"🦁"},{en:"Fish",ar:"سمكة",em:"🐟"},{en:"Bird",ar:"طائر",em:"🐦"},{en:"Rabbit",ar:"أرنب",em:"🐇"}],
    L2:[{en:"The cat is sleeping",ar:"القطة نائمة",em:"🐱"},{en:"The dog is running",ar:"الكلب يركض",em:"🐕"},{en:"The bird can fly",ar:"الطائر يستطيع الطيران",em:"🐦"},{en:"The fish is in the water",ar:"السمكة في الماء",em:"🐟"}],
    L3:[{en:"My favorite animal is the rabbit because it is cute",ar:"حيواني المفضل هو الأرنب لأنه لطيف",em:"🐇"},{en:"Lions live in Africa and they are very strong",ar:"الأسود تعيش في أفريقيا وهي قوية جداً",em:"🦁"}]},
  { id:"food",na:"الطعام",ne:"Food",em:"🍕",cl:"#E63946",
    L1:[{en:"Apple",ar:"تفاحة",em:"🍎"},{en:"Bread",ar:"خبز",em:"🍞"},{en:"Rice",ar:"أرز",em:"🍚"},{en:"Milk",ar:"حليب",em:"🥛"},{en:"Egg",ar:"بيضة",em:"🥚"},{en:"Cake",ar:"كعكة",em:"🎂"}],
    L2:[{en:"I like to eat rice",ar:"أحب أكل الأرز",em:"🍚"},{en:"The cake is sweet",ar:"الكعكة حلوة",em:"🎂"},{en:"I drink milk every day",ar:"أشرب الحليب كل يوم",em:"🥛"},{en:"Bread is on the table",ar:"الخبز على الطاولة",em:"🍞"}],
    L3:[{en:"For breakfast, I eat eggs and drink milk",ar:"في الفطور آكل البيض وأشرب الحليب",em:"🥚"},{en:"My mother makes the best cake in the world",ar:"أمي تصنع أفضل كعكة في العالم",em:"🎂"}]},
  { id:"colors",na:"الألوان",ne:"Colors",em:"🎨",cl:"#7B2D8E",
    L1:[{en:"Red",ar:"أحمر",em:"🔴"},{en:"Blue",ar:"أزرق",em:"🔵"},{en:"Green",ar:"أخضر",em:"🟢"},{en:"Yellow",ar:"أصفر",em:"🟡"},{en:"White",ar:"أبيض",em:"⚪"},{en:"Black",ar:"أسود",em:"⚫"}],
    L2:[{en:"The sky is blue",ar:"السماء زرقاء",em:"🔵"},{en:"The grass is green",ar:"العشب أخضر",em:"🟢"},{en:"I like the red color",ar:"أحب اللون الأحمر",em:"🔴"},{en:"The sun is yellow",ar:"الشمس صفراء",em:"🟡"}],
    L3:[{en:"My favorite color is blue because it looks like the sea",ar:"لوني المفضل أزرق لأنه يشبه البحر",em:"🔵"},{en:"The rainbow has many beautiful colors",ar:"قوس المطر فيه ألوان جميلة كثيرة",em:"🌈"}]},
  { id:"numbers",na:"الأرقام",ne:"Numbers",em:"🔢",cl:"#0077B6",
    L1:[{en:"One",ar:"واحد",em:"1️⃣"},{en:"Two",ar:"اثنان",em:"2️⃣"},{en:"Three",ar:"ثلاثة",em:"3️⃣"},{en:"Five",ar:"خمسة",em:"5️⃣"},{en:"Ten",ar:"عشرة",em:"🔟"},{en:"Zero",ar:"صفر",em:"0️⃣"}],
    L2:[{en:"I have two hands",ar:"عندي يدان اثنتان",em:"✋"},{en:"There are five fingers",ar:"يوجد خمسة أصابع",em:"🖐️"},{en:"I am ten years old",ar:"عمري عشر سنوات",em:"🎂"},{en:"One plus one is two",ar:"واحد زائد واحد يساوي اثنين",em:"➕"}],
    L3:[{en:"I can count from one to one hundred in English",ar:"أستطيع العد من واحد إلى مئة بالإنجليزية",em:"💯"},{en:"There are twelve months in one year",ar:"يوجد اثنا عشر شهراً في السنة",em:"📅"}]},
  { id:"family",na:"العائلة",ne:"Family",em:"👨‍👩‍👧‍👦",cl:"#E07A5F",
    L1:[{en:"Mother",ar:"أم",em:"👩"},{en:"Father",ar:"أب",em:"👨"},{en:"Sister",ar:"أخت",em:"👧"},{en:"Brother",ar:"أخ",em:"👦"},{en:"Baby",ar:"طفل",em:"👶"},{en:"Family",ar:"عائلة",em:"👨‍👩‍👧‍👦"}],
    L2:[{en:"I love my mother",ar:"أحب أمي",em:"👩"},{en:"My father is tall",ar:"أبي طويل",em:"👨"},{en:"My sister is kind",ar:"أختي لطيفة",em:"👧"},{en:"We are a happy family",ar:"نحن عائلة سعيدة",em:"👨‍👩‍👧‍👦"}],
    L3:[{en:"My family has five people: father, mother, two sisters and me",ar:"عائلتي فيها خمسة أشخاص: أبي وأمي وأختان وأنا",em:"👨‍👩‍👧‍👦"},{en:"Every Friday we visit my grandmother",ar:"كل جمعة نزور جدتي",em:"👵"}]},
  { id:"body",na:"جسم الإنسان",ne:"Body",em:"🧍",cl:"#2A9D8F",
    L1:[{en:"Head",ar:"رأس",em:"🗣️"},{en:"Hand",ar:"يد",em:"✋"},{en:"Eye",ar:"عين",em:"👁️"},{en:"Ear",ar:"أذن",em:"👂"},{en:"Foot",ar:"قدم",em:"🦶"},{en:"Mouth",ar:"فم",em:"👄"}],
    L2:[{en:"I see with my eyes",ar:"أرى بعيني",em:"👁️"},{en:"I hear with my ears",ar:"أسمع بأذني",em:"👂"},{en:"I have two hands",ar:"عندي يدان",em:"✋"},{en:"My head is big",ar:"رأسي كبير",em:"🗣️"}],
    L3:[{en:"We use our eyes to see and our ears to hear",ar:"نستخدم عيوننا للرؤية وآذاننا للسمع",em:"👁️"},{en:"The human body has many important parts",ar:"جسم الإنسان فيه أجزاء كثيرة مهمة",em:"🧍"}]},
  { id:"school",na:"المدرسة",ne:"School",em:"🏫",cl:"#264653",
    L1:[{en:"Book",ar:"كتاب",em:"📖"},{en:"Pen",ar:"قلم",em:"🖊️"},{en:"Teacher",ar:"معلم",em:"👨‍🏫"},{en:"Student",ar:"طالب",em:"👨‍🎓"},{en:"Bag",ar:"حقيبة",em:"🎒"},{en:"Desk",ar:"مكتب",em:"🪑"}],
    L2:[{en:"I go to school every day",ar:"أذهب إلى المدرسة كل يوم",em:"🏫"},{en:"The teacher is kind",ar:"المعلم لطيف",em:"👨‍🏫"},{en:"I read my book",ar:"أقرأ كتابي",em:"📖"},{en:"My bag is heavy",ar:"حقيبتي ثقيلة",em:"🎒"}],
    L3:[{en:"My favorite subject at school is English because I like learning new words",ar:"مادتي المفضلة في المدرسة هي الإنجليزية لأني أحب تعلم كلمات جديدة",em:"📖"},{en:"The best teacher helps students learn with fun",ar:"أفضل معلم يساعد الطلاب على التعلم بالمرح",em:"👨‍🏫"}]},
  { id:"nature",na:"الطبيعة",ne:"Nature",em:"🌳",cl:"#386641",
    L1:[{en:"Sun",ar:"شمس",em:"☀️"},{en:"Moon",ar:"قمر",em:"🌙"},{en:"Star",ar:"نجمة",em:"⭐"},{en:"Tree",ar:"شجرة",em:"🌳"},{en:"Rain",ar:"مطر",em:"🌧️"},{en:"Sea",ar:"بحر",em:"🌊"}],
    L2:[{en:"The sun is very hot",ar:"الشمس حارة جداً",em:"☀️"},{en:"Stars shine at night",ar:"النجوم تلمع في الليل",em:"⭐"},{en:"I love the rain",ar:"أحب المطر",em:"🌧️"},{en:"The sea is beautiful",ar:"البحر جميل",em:"🌊"}],
    L3:[{en:"When it rains, I can see a rainbow in the sky",ar:"عندما تمطر أستطيع رؤية قوس المطر في السماء",em:"🌈"},{en:"The moon and stars appear at night when the sun goes down",ar:"القمر والنجوم يظهرون في الليل عندما تغيب الشمس",em:"🌙"}]},
  { id:"clothes",na:"الملابس",ne:"Clothes",em:"👕",cl:"#BC4749",
    L1:[{en:"Shirt",ar:"قميص",em:"👕"},{en:"Pants",ar:"بنطال",em:"👖"},{en:"Shoes",ar:"حذاء",em:"👟"},{en:"Hat",ar:"قبعة",em:"🧢"},{en:"Dress",ar:"فستان",em:"👗"},{en:"Socks",ar:"جوارب",em:"🧦"}],
    L2:[{en:"I wear my shoes",ar:"ألبس حذائي",em:"👟"},{en:"The dress is pretty",ar:"الفستان جميل",em:"👗"},{en:"My hat is blue",ar:"قبعتي زرقاء",em:"🧢"},{en:"I need new pants",ar:"أحتاج بنطالاً جديداً",em:"👖"}],
    L3:[{en:"In winter I wear a jacket and in summer I wear a shirt",ar:"في الشتاء ألبس جاكيت وفي الصيف ألبس قميص",em:"🧥"},{en:"My mother bought me new shoes for school",ar:"أمي اشترت لي حذاءً جديداً للمدرسة",em:"👟"}]},
  { id:"home",na:"البيت",ne:"Home",em:"🏠",cl:"#6D597A",
    L1:[{en:"Door",ar:"باب",em:"🚪"},{en:"Window",ar:"نافذة",em:"🪟"},{en:"Bed",ar:"سرير",em:"🛏️"},{en:"Chair",ar:"كرسي",em:"🪑"},{en:"Table",ar:"طاولة",em:"🪑"},{en:"Room",ar:"غرفة",em:"🏠"}],
    L2:[{en:"Open the door please",ar:"افتح الباب من فضلك",em:"🚪"},{en:"My bed is comfortable",ar:"سريري مريح",em:"🛏️"},{en:"Sit on the chair",ar:"اجلس على الكرسي",em:"🪑"},{en:"My room is clean",ar:"غرفتي نظيفة",em:"🏠"}],
    L3:[{en:"My house has three rooms, a kitchen and a garden",ar:"بيتي فيه ثلاث غرف ومطبخ وحديقة",em:"🏠"},{en:"I help my mother clean the house every weekend",ar:"أساعد أمي في تنظيف البيت كل نهاية أسبوع",em:"🧹"}]},
  { id:"weather",na:"الطقس",ne:"Weather",em:"⛅",cl:"#457B9D",
    L1:[{en:"Hot",ar:"حار",em:"🔥"},{en:"Cold",ar:"بارد",em:"🥶"},{en:"Wind",ar:"رياح",em:"💨"},{en:"Snow",ar:"ثلج",em:"❄️"},{en:"Cloud",ar:"سحابة",em:"☁️"},{en:"Rain",ar:"مطر",em:"🌧️"}],
    L2:[{en:"Today is very hot",ar:"اليوم حار جداً",em:"🔥"},{en:"It is raining outside",ar:"إنها تمطر في الخارج",em:"🌧️"},{en:"The wind is strong",ar:"الرياح قوية",em:"💨"},{en:"I like cold weather",ar:"أحب الطقس البارد",em:"🥶"}],
    L3:[{en:"In Qatar it is hot in summer and warm in winter",ar:"في قطر الجو حار في الصيف ودافئ في الشتاء",em:"☀️"},{en:"When it snows, children play outside and make snowmen",ar:"عندما تثلج يلعب الأطفال في الخارج ويصنعون رجل الثلج",em:"⛄"}]},
  { id:"fruits",na:"الفواكه",ne:"Fruits",em:"🍎",cl:"#D62828",
    L1:[{en:"Banana",ar:"موز",em:"🍌"},{en:"Orange",ar:"برتقال",em:"🍊"},{en:"Grape",ar:"عنب",em:"🍇"},{en:"Mango",ar:"مانجو",em:"🥭"},{en:"Lemon",ar:"ليمون",em:"🍋"},{en:"Melon",ar:"بطيخ",em:"🍉"}],
    L2:[{en:"Bananas are yellow",ar:"الموز أصفر",em:"🍌"},{en:"I eat fruit every day",ar:"آكل فاكهة كل يوم",em:"🍎"},{en:"Oranges have vitamin C",ar:"البرتقال فيه فيتامين سي",em:"🍊"},{en:"Grapes are sweet",ar:"العنب حلو",em:"🍇"}],
    L3:[{en:"My favorite fruit is mango because it is sweet and delicious",ar:"فاكهتي المفضلة المانجو لأنها حلوة ولذيذة",em:"🥭"},{en:"Eating fruits and vegetables keeps us healthy and strong",ar:"أكل الفواكه والخضروات يبقينا أصحاء وأقوياء",em:"💪"}]},
  { id:"vehicles",na:"المركبات",ne:"Vehicles",em:"🚗",cl:"#3D5A80",
    L1:[{en:"Car",ar:"سيارة",em:"🚗"},{en:"Bus",ar:"حافلة",em:"🚌"},{en:"Plane",ar:"طائرة",em:"✈️"},{en:"Boat",ar:"قارب",em:"🚤"},{en:"Train",ar:"قطار",em:"🚂"},{en:"Bike",ar:"دراجة",em:"🚲"}],
    L2:[{en:"The car is fast",ar:"السيارة سريعة",em:"🚗"},{en:"I ride the bus to school",ar:"أركب الحافلة إلى المدرسة",em:"🚌"},{en:"Planes fly in the sky",ar:"الطائرات تطير في السماء",em:"✈️"},{en:"I like riding my bike",ar:"أحب ركوب دراجتي",em:"🚲"}],
    L3:[{en:"My father drives us to school by car every morning",ar:"أبي يوصلنا إلى المدرسة بالسيارة كل صباح",em:"🚗"},{en:"One day I want to travel by plane to see the world",ar:"يوماً ما أريد السفر بالطائرة لأرى العالم",em:"✈️"}]},
  { id:"jobs",na:"المهن",ne:"Jobs",em:"👨‍⚕️",cl:"#5F0F40",
    L1:[{en:"Doctor",ar:"طبيب",em:"👨‍⚕️"},{en:"Police",ar:"شرطي",em:"👮"},{en:"Farmer",ar:"مزارع",em:"👨‍🌾"},{en:"Cook",ar:"طباخ",em:"👨‍🍳"},{en:"Pilot",ar:"طيار",em:"👨‍✈️"},{en:"Nurse",ar:"ممرض",em:"👨‍⚕️"}],
    L2:[{en:"The doctor helps sick people",ar:"الطبيب يساعد المرضى",em:"👨‍⚕️"},{en:"The farmer grows food",ar:"المزارع يزرع الطعام",em:"👨‍🌾"},{en:"I want to be a pilot",ar:"أريد أن أكون طياراً",em:"👨‍✈️"},{en:"The cook makes food",ar:"الطباخ يصنع الطعام",em:"👨‍🍳"}],
    L3:[{en:"When I grow up I want to be a doctor to help people",ar:"عندما أكبر أريد أن أكون طبيباً لأساعد الناس",em:"👨‍⚕️"},{en:"Every job is important because we all need each other",ar:"كل مهنة مهمة لأننا جميعاً نحتاج بعضنا",em:"🤝"}]},
  { id:"actions",na:"الأفعال",ne:"Actions",em:"🏃",cl:"#FB8500",
    L1:[{en:"Run",ar:"يركض",em:"🏃"},{en:"Jump",ar:"يقفز",em:"🤸"},{en:"Eat",ar:"يأكل",em:"🍽️"},{en:"Sleep",ar:"ينام",em:"😴"},{en:"Read",ar:"يقرأ",em:"📖"},{en:"Play",ar:"يلعب",em:"⚽"}],
    L2:[{en:"I run every morning",ar:"أركض كل صباح",em:"🏃"},{en:"Children love to play",ar:"الأطفال يحبون اللعب",em:"⚽"},{en:"I read before I sleep",ar:"أقرأ قبل أن أنام",em:"📖"},{en:"We eat together",ar:"نأكل معاً",em:"🍽️"}],
    L3:[{en:"Every day I wake up early, eat breakfast, and go to school",ar:"كل يوم أستيقظ باكراً وأفطر وأذهب إلى المدرسة",em:"🌅"},{en:"After school I play with my friends then read my favorite book",ar:"بعد المدرسة ألعب مع أصدقائي ثم أقرأ كتابي المفضل",em:"📖"}]},
  { id:"feelings",na:"المشاعر",ne:"Feelings",em:"😊",cl:"#F72585",
    L1:[{en:"Happy",ar:"سعيد",em:"😊"},{en:"Sad",ar:"حزين",em:"😢"},{en:"Angry",ar:"غاضب",em:"😠"},{en:"Scared",ar:"خائف",em:"😨"},{en:"Tired",ar:"متعب",em:"😴"},{en:"Brave",ar:"شجاع",em:"💪"}],
    L2:[{en:"I am very happy today",ar:"أنا سعيد جداً اليوم",em:"😊"},{en:"Do not be scared",ar:"لا تكن خائفاً",em:"😨"},{en:"My friend is brave",ar:"صديقي شجاع",em:"💪"},{en:"I am tired after playing",ar:"أنا متعب بعد اللعب",em:"😴"}],
    L3:[{en:"When I help others I feel happy and proud of myself",ar:"عندما أساعد الآخرين أشعر بالسعادة والفخر بنفسي",em:"😊"},{en:"It is okay to feel sad sometimes but we should talk about it",ar:"لا بأس أن نشعر بالحزن أحياناً لكن يجب أن نتحدث عن مشاعرنا",em:"💙"}]},
  { id:"places",na:"الأماكن",ne:"Places",em:"🏪",cl:"#606C38",
    L1:[{en:"Park",ar:"حديقة",em:"🏞️"},{en:"Shop",ar:"متجر",em:"🏪"},{en:"Beach",ar:"شاطئ",em:"🏖️"},{en:"Hospital",ar:"مستشفى",em:"🏥"},{en:"Library",ar:"مكتبة",em:"📚"},{en:"Mosque",ar:"مسجد",em:"🕌"}],
    L2:[{en:"I play in the park",ar:"ألعب في الحديقة",em:"🏞️"},{en:"We go to the beach",ar:"نذهب إلى الشاطئ",em:"🏖️"},{en:"The library has many books",ar:"المكتبة فيها كتب كثيرة",em:"📚"},{en:"We pray in the mosque",ar:"نصلي في المسجد",em:"🕌"}],
    L3:[{en:"On Friday my family goes to the mosque then we visit the park",ar:"يوم الجمعة عائلتي تذهب إلى المسجد ثم نزور الحديقة",em:"🕌"},{en:"The library is my favorite place because I love reading books",ar:"المكتبة مكاني المفضل لأنني أحب قراءة الكتب",em:"📚"}]},
  { id:"time",na:"الوقت",ne:"Time",em:"⏰",cl:"#9B5DE5",
    L1:[{en:"Morning",ar:"صباح",em:"🌅"},{en:"Night",ar:"ليل",em:"🌙"},{en:"Today",ar:"اليوم",em:"📅"},{en:"Monday",ar:"الاثنين",em:"1️⃣"},{en:"Friday",ar:"الجمعة",em:"🕌"},{en:"Hour",ar:"ساعة",em:"⏰"}],
    L2:[{en:"Good morning",ar:"صباح الخير",em:"🌅"},{en:"It is night time",ar:"حان وقت الليل",em:"🌙"},{en:"Today is Friday",ar:"اليوم هو الجمعة",em:"🕌"},{en:"What time is it",ar:"كم الساعة",em:"⏰"}],
    L3:[{en:"I wake up in the morning at six o'clock and go to bed at nine",ar:"أستيقظ في الصباح الساعة السادسة وأنام الساعة التاسعة",em:"⏰"},{en:"There are seven days in a week and my favorite day is Friday",ar:"في الأسبوع سبعة أيام ويومي المفضل هو الجمعة",em:"📅"}]},
  { id:"sports",na:"الرياضة",ne:"Sports",em:"⚽",cl:"#00A896",
    L1:[{en:"Ball",ar:"كرة",em:"⚽"},{en:"Swim",ar:"يسبح",em:"🏊"},{en:"Race",ar:"سباق",em:"🏁"},{en:"Goal",ar:"هدف",em:"🥅"},{en:"Team",ar:"فريق",em:"👥"},{en:"Win",ar:"يفوز",em:"🏆"}],
    L2:[{en:"I play with the ball",ar:"ألعب بالكرة",em:"⚽"},{en:"I can swim fast",ar:"أستطيع السباحة بسرعة",em:"🏊"},{en:"Our team will win",ar:"فريقنا سيفوز",em:"🏆"},{en:"I scored a goal",ar:"سجلت هدفاً",em:"🥅"}],
    L3:[{en:"Sports keep our body healthy and our mind strong",ar:"الرياضة تحافظ على صحة جسمنا وقوة عقلنا",em:"💪"},{en:"My favorite sport is swimming because I love water",ar:"رياضتي المفضلة السباحة لأنني أحب الماء",em:"🏊"}]},
  { id:"greetings",na:"التحيات",ne:"Greetings",em:"👋",cl:"#EE6C4D",
    L1:[{en:"Hello",ar:"مرحباً",em:"👋"},{en:"Goodbye",ar:"مع السلامة",em:"👋"},{en:"Please",ar:"من فضلك",em:"🙏"},{en:"Thanks",ar:"شكراً",em:"🙏"},{en:"Sorry",ar:"آسف",em:"😔"},{en:"Yes",ar:"نعم",em:"✅"}],
    L2:[{en:"Hello, how are you?",ar:"مرحباً، كيف حالك؟",em:"👋"},{en:"Thank you very much",ar:"شكراً جزيلاً",em:"🙏"},{en:"I am sorry",ar:"أنا آسف",em:"😔"},{en:"See you tomorrow",ar:"أراك غداً",em:"👋"}],
    L3:[{en:"When I meet someone new I say hello and tell them my name",ar:"عندما أقابل شخصاً جديداً أقول مرحباً وأخبره باسمي",em:"👋"},{en:"We should always say please and thank you to be polite",ar:"يجب أن نقول دائماً من فضلك وشكراً لنكون مؤدبين",em:"🙏"}]},
];

const LEVELS = [
  { id: "L1", na: "مبتدئ", ne: "Beginner", em: "🌱", cl: "#28a745", desc: "كلمات مفردة" },
  { id: "L2", na: "متوسط", ne: "Intermediate", em: "🌿", cl: "#ffc107", desc: "جمل قصيرة" },
  { id: "L3", na: "متقدم", ne: "Advanced", em: "🌳", cl: "#dc3545", desc: "جمل مركّبة" },
];

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

/* ═══════ QUIZ GAME ═══════ */
function QuizGame({words,onFinish,cc,isAdvanced}){
  const [qi,setQi]=useState(0);const [sc,setSc]=useState(0);const [sel,setSel]=useState(null);const [opts,setOpts]=useState([]);const [nxt,setNxt]=useState(false);
  const mk=useCallback(i=>{const c=words[i];return shuffle([c,...shuffle(words.filter(w=>w.en!==c.en)).slice(0,3)]);}, [words]);
  useEffect(()=>{setOpts(mk(qi));setSel(null);setNxt(false);setTimeout(()=>speakAr(words[qi].ar),300);},[qi,mk,words]);
  const pick=async(o)=>{if(sel)return;sfxTap();setSel(o.en);const ok=o.en===words[qi].en;if(ok){setSc(s=>s+1);sfxCorrect();await speakEn(o.en);}else{sfxWrong();await speakEn(words[qi].en);}setNxt(true);};
  const go=()=>{if(qi+1>=words.length)onFinish(sc);else setQi(i=>i+1);};
  useEffect(()=>{if(nxt&&qi+1>=words.length){const t=setTimeout(()=>onFinish(sc),1400);return()=>clearTimeout(t);}},[nxt,qi,words.length,sc,onFinish]);
  const cur=words[qi],ok=sel===cur.en;
  return <div style={{textAlign:"center"}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,fontSize:12,color:"#999"}}><span>{qi+1}/{words.length}</span><span>⭐ {sc}</span></div>
    <div style={{background:`${cc}10`,borderRadius:18,padding:"22px 16px",marginBottom:18}}>
      <div style={{fontSize:isAdvanced?14:44,marginBottom:6}}>{isAdvanced?"📝":cur.em}</div>
      <div style={{fontSize:isAdvanced?16:24,fontWeight:700,color:cc,lineHeight:1.6}}>{cur.ar}</div>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8}}>
        <button onClick={()=>speakAr(cur.ar)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,opacity:.6}}>🔈</button>
        <button onClick={()=>speakEn(cur.en)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,opacity:.6}}>🔊</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:isAdvanced?"1fr":"1fr 1fr",gap:8}}>
      {opts.map(o=>{let bg="white",bd="#e8e8e8",cl="#333";if(sel){if(o.en===cur.en){bg="#d4edda";bd="#28a745";cl="#155724";}else if(o.en===sel){bg="#f8d7da";bd="#dc3545";cl="#721c24";}}
      return <button key={o.en} onClick={()=>pick(o)} style={{padding:isAdvanced?"12px":"14px 8px",borderRadius:12,border:`2px solid ${bd}`,background:bg,cursor:sel?"default":"pointer",fontSize:isAdvanced?12:15,fontWeight:600,color:cl,transition:"all .2s",fontFamily:isAdvanced?"'Noto Kufi Arabic','Fredoka',sans-serif":"'Fredoka',sans-serif",textAlign:isAdvanced?"right":"center",lineHeight:1.5}}>{isAdvanced?o.en:`${o.em} ${o.en}`}</button>;})}
    </div>
    {nxt&&qi+1<words.length&&<button onClick={go} style={{marginTop:14,padding:"10px 32px",borderRadius:24,border:"none",background:cc,color:"white",fontSize:14,fontWeight:700,cursor:"pointer"}}>التالي ←</button>}
    {sel&&<div style={{marginTop:12,padding:10,borderRadius:10,background:ok?"#d4edda":"#fff3cd",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      {ok?"🎉 أحسنت!":<>❌ <strong style={{fontFamily:"'Fredoka'",fontSize:12}}>{cur.en}</strong><button onClick={()=>speakEn(cur.en)} style={{background:"none",border:"none",cursor:"pointer",fontSize:16}}>🔈</button></>}
    </div>}
  </div>;
}

/* ═══════ MAIN APP ═══════ */
export default function EnglishQuestV2(){
  const [scr,setScr]=useState("map");
  const [cat,setCat]=useState(null);
  const [lvl,setLvl]=useState(null);
  const [fs,setFs]=useState(0);const [tq,setTq]=useState(0);
  const [stars,setStars]=useState(()=>{try{return {};}catch(e){return {};}});
  const [totalStars,setTotalStars]=useState(0);

  const getStar=(catId,lvlId)=>stars[`${catId}_${lvlId}`]||0;
  const catTotalStars=(catId)=>LEVELS.reduce((s,l)=>s+getStar(catId,l.id),0);

  const startGame=(c,l)=>{sfxTap();setCat(c);setLvl(l);setScr("play");};

  const finish=useCallback((score)=>{
    const words=cat[lvl.id];const total=words.length;
    setFs(score);setTq(total);
    const p=total>0?score/total:0;
    const s=p>=.9?3:p>=.6?2:p>=.3?1:0;
    const key=`${cat.id}_${lvl.id}`;
    const prev=stars[key]||0;
    if(s>prev){setStars(st=>({...st,[key]:s}));setTotalStars(t=>t+(s-prev));}
    if(p>=.9)sfxLevelUp();else if(p>=.6)sfxVictory();else sfxWrong();
    if(s>0)setTimeout(sfxStar,500);
    setScr("result");
  },[cat,lvl,stars]);

  const unlockedCount=Object.keys(stars).length;

  return <div style={{minHeight:"100vh",direction:"rtl",fontFamily:"'Noto Kufi Arabic','Fredoka',sans-serif",background:"linear-gradient(180deg,#0f172a 0%,#1e293b 100%)"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap');
      @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(46,196,182,.3)}50%{box-shadow:0 0 20px rgba(46,196,182,.6)}}
      *{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}
    `}</style>

    {/* HEADER */}
    <div style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Faseeh expr="happy" size={36}/>
        <div><div style={{fontSize:16,fontWeight:800,color:"white"}}>English Quest</div>
        <div style={{fontSize:10,color:"#2EC4B6"}}>رحلة فصيح</div></div>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{background:"rgba(255,190,11,.15)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#FFBE0B",fontWeight:700}}>⭐ {totalStars}</div>
        <div style={{background:"rgba(46,196,182,.15)",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#2EC4B6",fontWeight:700}}>🏆 {unlockedCount}/{CATS.length*3}</div>
      </div>
    </div>

    <div style={{maxWidth:480,margin:"0 auto",padding:"0 14px 24px"}}>

      {/* ═══ MAP ═══ */}
      {scr==="map"&&<div>
        {/* Level filter */}
        <div style={{display:"flex",gap:8,marginBottom:16,justifyContent:"center"}}>
          {LEVELS.map(l=><button key={l.id} onClick={()=>setLvl(lvl?.id===l.id?null:l)} style={{
            padding:"6px 14px",borderRadius:20,border:`2px solid ${lvl?.id===l.id?l.cl:"#334155"}`,
            background:lvl?.id===l.id?`${l.cl}20`:"transparent",color:lvl?.id===l.id?l.cl:"#94a3b8",
            fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s",
          }}>{l.em} {l.na}</button>)}
        </div>

        {/* Category cards */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {CATS.map((c,i)=>{
            const ts=catTotalStars(c.id);
            return <button key={c.id} onClick={()=>{sfxTap();setCat(c);setScr("levels");}}
              style={{
                display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                borderRadius:16,border:"1px solid #334155",background:"#1e293b",
                cursor:"pointer",textAlign:"right",transition:"all .25s",
                animation:`fadeIn .3s ease-out ${i*.03}s both`,
              }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=c.cl}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}>
              <div style={{fontSize:28,width:48,height:48,borderRadius:12,background:`${c.cl}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"white"}}>{c.na}</div>
                <div style={{fontSize:11,color:"#64748b",fontFamily:"'Fredoka'"}}>{c.ne}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{fontSize:12,color:"#FFBE0B"}}>{ts>0?"⭐".repeat(Math.min(ts,3))+(ts>3?`+${ts-3}`:""):"—"}</div>
                <div style={{fontSize:9,color:"#475569"}}>{ts}/9</div>
              </div>
            </button>;
          })}
        </div>
      </div>}

      {/* ═══ LEVELS ═══ */}
      {scr==="levels"&&cat&&<div style={{animation:"fadeIn .3s ease-out"}}>
        <button onClick={()=>{setScr("map");window.speechSynthesis?.cancel();}} style={{background:"none",border:"none",fontSize:12,color:"#64748b",cursor:"pointer",marginBottom:14}}>→ الخريطة</button>
        <div style={{textAlign:"center",padding:"24px 16px",borderRadius:20,background:`${cat.cl}10`,border:`1px solid ${cat.cl}30`,marginBottom:20}}>
          <div style={{fontSize:48}}>{cat.em}</div>
          <h2 style={{fontSize:22,fontWeight:800,color:"white",margin:"8px 0"}}>{cat.na}</h2>
          <div style={{fontSize:12,color:"#94a3b8",fontFamily:"'Fredoka'"}}>{cat.ne} — اختر المستوى</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {LEVELS.map((l,i)=>{
            const s=getStar(cat.id,l.id);
            const words=cat[l.id];
            return <button key={l.id} onClick={()=>startGame(cat,l)} style={{
              display:"flex",alignItems:"center",gap:14,padding:"18px 16px",borderRadius:16,
              border:`2px solid ${l.cl}30`,background:"#1e293b",cursor:"pointer",textAlign:"right",
              transition:"all .25s",animation:`fadeIn .3s ease-out ${i*.1}s both`,
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=l.cl;e.currentTarget.style.background="#263040";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${l.cl}30`;e.currentTarget.style.background="#1e293b";}}>
              <div style={{fontSize:28,width:52,height:52,borderRadius:14,background:`${l.cl}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{l.em}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:"white"}}>{l.na} <span style={{fontSize:12,color:"#64748b",fontFamily:"'Fredoka'"}}>{l.ne}</span></div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{l.desc} — {words.length} عنصر</div>
                <div style={{marginTop:4,fontSize:14,color:"#FFBE0B"}}>{s>0?"⭐".repeat(s)+"☆".repeat(3-s):"☆☆☆"}</div>
              </div>
            </button>;
          })}
        </div>
      </div>}

      {/* ═══ PLAY ═══ */}
      {scr==="play"&&cat&&lvl&&<div style={{animation:"fadeIn .3s ease-out"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <button onClick={()=>{window.speechSynthesis?.cancel();setScr("levels");}} style={{background:"none",border:"none",fontSize:12,color:"#64748b",cursor:"pointer"}}>→ رجوع</button>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:11,color:"#64748b"}}>{cat.em} {cat.na}</span>
            <span style={{fontSize:10,color:lvl.cl,background:`${lvl.cl}20`,padding:"2px 8px",borderRadius:10,fontWeight:600}}>{lvl.em} {lvl.na}</span>
          </div>
        </div>
        <div style={{background:"#1e293b",borderRadius:20,padding:"20px 16px",border:"1px solid #334155"}}>
          <QuizGame words={shuffle(cat[lvl.id])} onFinish={finish} cc={cat.cl} isAdvanced={lvl.id!=="L1"}/>
        </div>
      </div>}

      {/* ═══ RESULT ═══ */}
      {scr==="result"&&<div style={{animation:"fadeIn .4s ease-out",textAlign:"center"}}>
        <div style={{background:"#1e293b",borderRadius:24,padding:"32px 20px",border:"1px solid #334155"}}>
          <div style={{animation:"float 2s ease-in-out infinite"}}>
            <Faseeh expr={fs===tq?"celebrating":fs>=tq*.6?"happy":"encouraging"} size={120}/>
          </div>
          <h2 style={{fontSize:22,fontWeight:800,color:"white",margin:"12px 0 6px"}}>
            {fs===tq?"🌟 مثالي!":fs>=tq*.7?"!أحسنت يا بطل":fs>=tq*.4?"!جيد":"!لا تستسلم"}
          </h2>
          <div style={{fontSize:36,letterSpacing:6,margin:"8px 0"}}>
            {[1,2,3].map(s=>{const p=tq>0?fs/tq:0;const st=p>=.9?3:p>=.6?2:p>=.3?1:0;return <span key={s} style={{opacity:s<=st?1:.2}}>⭐</span>;})}
          </div>
          <div style={{background:"#0f172a",borderRadius:14,padding:"14px",margin:"16px auto",maxWidth:200}}>
            <div style={{fontSize:28,fontWeight:800,color:fs===tq?"#2EC4B6":"#FFBE0B"}}>{fs} / {tq}</div>
          </div>
          <div style={{fontSize:13,color:"#94a3b8",marginBottom:20}}>
            {fs===tq?"نتيجة مثالية! فصيح فخور بك!":fs>=tq*.7?"ممتاز! استمر هكذا!":fs>=tq*.4?"جيد! حاول مرة أخرى!":"فصيح يقول: التكرار يصنع الأبطال!"}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{sfxTap();setScr("play");}} style={{padding:"10px 24px",borderRadius:24,border:`2px solid ${cat?.cl}`,background:"transparent",color:cat?.cl,fontSize:13,fontWeight:700,cursor:"pointer"}}>🔄 أعد</button>
            <button onClick={()=>{sfxTap();setScr("levels");}} style={{padding:"10px 24px",borderRadius:24,border:"none",background:cat?.cl,color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>📋 المستويات</button>
            <button onClick={()=>{sfxTap();setScr("map");}} style={{padding:"10px 24px",borderRadius:24,border:"none",background:"#2EC4B6",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>🗺️ الخريطة</button>
          </div>
        </div>
      </div>}

    </div>
  </div>;
}


export const LOCALES = ['en', 'hi', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'ja', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

export const DEFAULT_LOCALE: Locale = 'en';

export const STORAGE_KEY = 'at75_locale';


type Dict = Record<string, string>;

const en: Dict = {
  'nav.today': "Today's Schedule",
  'nav.weekly': 'Weekly Schedule',
  'nav.subjects': 'Subjects',
  'nav.calculator': 'Calculator',
  'nav.sessions': 'Sessions',
  'nav.settings': 'Settings',
  'nav.tracker': 'Tracker',

  'shell.logOut': 'Log out',
  'shell.loggingOut': 'Logging out…',
  'shell.toggleMenu': 'Toggle menu',
  'shell.openMenu': 'Open menu',
  'shell.profileSettings': 'Profile settings',
  'shell.accountSettings': 'Account settings',


  'btn.continue': 'Continue',
  'btn.back': 'Back',
  'btn.continueAsGuest': 'Continue as Guest',
  'btn.loginAsGuest': 'Login as Guest',
  'btn.continuing': 'Continuing…',
  'btn.save': 'Save',
  'btn.saving': 'Saving…',
  'btn.saveAndContinue': 'Save & Continue',
  'btn.createAccount': 'Create account',
  'btn.logIn': 'Log in',
  'btn.signUp': 'Sign up',
  'btn.getStarted': 'Get started',
  'btn.skipForNow': 'Skip for now',
  'btn.skipping': 'Skipping…',
  'btn.sendResetLink': 'Send reset link',
  'btn.pleaseWait': 'Please wait…',


  'auth.login.title': 'Welcome back',
  'auth.login.subtitle': 'Log in to keep your streak going.',
  'auth.login.emailLabel': 'Email',
  'auth.login.passwordLabel': 'Password',
  'auth.login.emailPlaceholder': 'you@example.com',
  'auth.login.passwordPlaceholder': '••••••••',
  'auth.login.forgotPassword': 'Forgot password?',
  'auth.login.newHere': 'New here?',
  'auth.login.createAccount': 'Create a free account',
  'auth.login.error.missingFields': 'Please enter your email and password.',
  'auth.login.error.generic': 'Login failed. Check your email/password.',


  'auth.signup.title': 'Create your account',
  'auth.signup.subtitle': 'Start tracking in under a minute.',
  'auth.signup.nameLabel': 'Full name',
  'auth.signup.namePlaceholder': 'e.g. John Doe',
  'auth.signup.emailLabel': 'Email',
  'auth.signup.passwordLabel': 'Password',
  'auth.signup.emailPlaceholder': 'you@example.com',
  'auth.signup.passwordPlaceholder': 'At least 8 characters',
  'auth.signup.passwordHint': 'Minimum 8 characters. Use a mix of letters and numbers.',
  'auth.signup.haveAccount': 'Already have an account?',
  'auth.signup.logIn': 'Log in',
  'auth.signup.legal': 'By creating an account, you agree to our',
  'auth.signup.terms': 'Terms',
  'auth.signup.and': 'and',
  'auth.signup.privacy': 'Privacy Policy',
  'auth.signup.error.shortPassword': 'Password must be at least 8 characters.',
  'auth.signup.error.generic': 'Signup failed. Please check your info.',


  'auth.forgot.title': 'Reset your password',
  'auth.forgot.subtitle': 'Enter your email and we will send a reset link.',
  'auth.forgot.sendButton': 'Send reset link',
  'auth.forgot.backToLogin': 'Back to log in',

  'landing.badge': 'Built for everyone',
  'landing.headline1': 'The Easiest Way to',
  'landing.headline2': 'Track Attendance.',
  'landing.subheadline':
    "Attendance Tracker turns your timetable into a daily 30-second habit. Tap Present, Absent, or Off for each class. The best free student attendance tracker for busy students.",
  'landing.ctaPrimary': 'Start Tracking',
  'landing.ctaGuest': 'Continue as Guest',
  'landing.ctaContinueSetup': 'Continue setup',
  'landing.ctaBottomTitle': 'Get Started with Your Free Student Attendance Tracker',
  'landing.ctaBottomBody':
    'Sign up in seconds, add your timetable, and take control of your academic life today.',
  'landing.ctaBottomButton': 'Start Tracking for Free',
  'landing.urlLabel': '/today',
  'landing.brand.logoLink': 'Attendance Tracker',

  // Onboarding
  'onboarding.welcome.step': 'Step 1 of 2',
  'onboarding.welcome.title': 'Welcome, {name}.',
  'onboarding.welcome.body':
    "Let's get your first session set up. It takes about two minutes.",
  'onboarding.welcome.titleReview': 'Reviewing step 1',
  'onboarding.welcome.bodyReview':
    "Here's the session you set up. You can head back to step 2 when you're ready.",
  'onboarding.welcome.backToStep2': 'Back to step 2',
  'onboarding.welcome.step1': 'Name your session and set the target percentage.',
  'onboarding.welcome.step2': 'Add your weekly timetable (manual or paste-text).',
  'onboarding.welcome.getStarted': 'Get started',
  'onboarding.welcome.backToSignup': 'Back',
  'onboarding.welcome.backAria': 'Back',

  'onboarding.session.step': 'Step 1 of 2',
  'onboarding.session.title': 'Name your session',
  'onboarding.session.body':
    'A session is one academic term — like "Fall 2026". You can keep multiple sessions and switch between them.',
  'onboarding.session.nameLabel': 'Session name',
  'onboarding.session.startDate': 'Start date',
  'onboarding.session.endDate': 'End date',
  'onboarding.session.targetPct': 'Target percentage: {pct}%',
  'onboarding.session.targetPctHint':
    'The cutoff your college enforces. Most Indian colleges use 75%; most US universities use 80%.',
  'onboarding.session.continue': 'Continue',
  'onboarding.session.creating': 'Creating…',
  'onboarding.session.errorRequired': 'All fields are required.',

  'onboarding.timetable.step': 'Step 2 of 2',
  'onboarding.timetable.title': 'Add your weekly timetable',
  'onboarding.timetable.body':
    "Add your subjects, then click cells to add classes. Drag to move. You can also paste a plain-text timetable below and we'll fill the grid for you.",
  'onboarding.timetable.pasteTitle': '📋 Paste timetable text',
  'onboarding.timetable.pasteHelp':
    'Load your timetable in the given format below, or ask your AI to format it for you:',
  'onboarding.timetable.pasteInput': 'Input',
  'onboarding.timetable.pastePreview': 'Preview',
  'onboarding.timetable.applySchedule': 'Apply Schedule',

  // Today page
  'today.title': 'Today',
  'today.empty.title': 'No classes today',
  'today.empty.body': 'Enjoy your day off',
  'today.empty.hint': 'Add classes to your weekly schedule to see them here.',
  'today.markTitle': "Mark Attendance",
  'today.scheduleTitle': "Today's schedule",
  'today.overall': 'Overall Attendance',

  // Empty state copy
  'empty.noSession': 'No session yet',
  'empty.startSetup': 'Start setup',
  'empty.useCalculator': 'Use calculator',

  // Errors
  'error.network': 'Network error. Please try again.',
  'error.generic': 'Something went wrong. Please try again.',

  // FAQ section title
  'faq.title': 'Why Students Love Our Free Attendance Tracker',
  'faq.subtitle': 'Everything students ask about the free attendance tracker.',

  // FAQ Q/A pairs
  'faq.q1': 'Is this attendance tracker really free?',
  'faq.a1': "Yes — 100% free, no credit card, no trial, no hidden paywalls. You can use our free attendance tracker to log your classes, build your weekly schedule, and see your running percentage for as long as you want. The paid version is the same version; we don't gate features behind a subscription.",
  'faq.q2': 'How do I track my attendance as a student?',
  'faq.a2': "Sign up, add the subjects and labs you're taking, paste or build your weekly timetable, then mark each class as present, absent, or off. Our student attendance tracker does the percentage math for you and tells you exactly how many more classes you can afford to miss per subject without dropping below your target.",
  'faq.q3': 'Can I use this attendance tracker online from my phone?',
  'faq.a3': 'Yes. Our student attendance tracker online works in any modern browser, on any device — phone, tablet, or laptop. Nothing to download, nothing to install. Sign in once and your data follows you.',
  'faq.q4': 'Is there an attendance tracker app I can download?',
  'faq.a4': "You don't need one. Our web app is a full attendance tracker app you can pin to your phone's home screen in one tap, so it behaves like a native app without forcing you to attendance tracker app free download from an app store. You get the same speed, full-screen experience, and offline-friendly feel.",
  'faq.q5': 'How does the 75% attendance criteria tracker work?',
  'faq.a5': 'Most Indian colleges and several international universities enforce a mandatory 75% attendance rule. Our attendance tracker 75% criteria feature lets you set a custom target per session (50–100%) and instantly shows your current percentage, how many classes you have attended, and how many you can still miss. We support 80% targets too — anything between 50 and 100.',
  'faq.q6': "What's the easiest way to track attendance every day?",
  'faq.a6': "Open the Today page, look at the day's classes, and tap +, −, or Off for each subject. The whole flow takes under 30 seconds. It's the easiest way to track attendance because you don't have to remember anything later — the day, the time, and the subject are all already filled in for you from your weekly timetable.",
  'faq.q7': 'Can I use this as an attendance tracker for school?',
  'faq.a7': 'Absolutely. While the app is designed around the college-style weekly timetable, it works equally well as an attendance tracker for school free of charge. Add your subjects, set your timetable, and start marking. There is no limit on the number of subjects or sessions.',
  'faq.q8': 'Is there a free student attendance tracking system with no signup?',
  'faq.a8': 'You can try the app as a guest without creating an account, but to keep your data across devices and sessions, signing up with an email takes 10 seconds. Either way, you get the full free student attendance tracking system — no feature is locked behind an account.',
  'faq.q9': 'Can I share my attendance sheet or export it?',
  'faq.a9': 'Your data lives in your account and you can review it anytime in the dashboard, weekly view, or per-subject view. Export to a printable attendance tracking sheet is on the roadmap — for now, the in-app views cover every report you would need to see at a glance.',
  'faq.q10': 'Does this work as an employee attendance tracker?',
  'faq.a10': "The app is built for the academic week cycle (Mon–Sun timetable, labs, percentage targets), so it isn't an employee attendance tracker in the HR / payroll sense. If you want a personal log of your work days off, you can use it that way, but for timecards, PTO, and payroll you will want a dedicated workforce tool.",
  'faq.q11': 'How do you compare to a spreadsheet or attendance tracking sheet?',
  'faq.a11': 'A tracking student attendance spreadsheet works until you have to count present days, weight labs, or remember holidays. Our app does the counting, the percentage math, the lab weighting, and the holiday detection automatically — and it works on your phone, which a spreadsheet usually does not.',

  // Marketing long-form copy (SEO paragraphs on the landing page)
  'seo.h2': 'The Ultimate Online Attendance Tracker for Students',
  'seo.p1':
    "Finding the {emph1}easiest way to track attendance{emphEnd} shouldn't be a chore. Whether you are a college student dealing with strict cutoff rules or a parent looking for a {emph2}homeschool attendance tracker{emphEnd}, our tool is built to simplify your academic life. In today's fast-paced educational environment, {emph3}tracking student attendance{emphEnd} manually using paper logs or complicated spreadsheets is outdated and prone to errors. Our {emph4}online attendance system{emphEnd} provides a seamless, digital alternative that fits right in your pocket.",
  'seo.h3.app': 'Why Use a Student Attendance Tracker App?',
  'seo.p2':
    "Most universities enforce a mandatory 75% attendance rule. Falling below this can mean being barred from exams or losing scholarships. Our {emph1}student attendance tracker{emphEnd} is designed specifically for this challenge. It doesn't just count days; it performs the heavy-duty math for you. By using {emph2}my attendance tracker{emphEnd}, you can see at a glance exactly how many classes you can afford to miss for each subject without dropping below your target percentage.",
  'seo.h3.free': '100% Free Student Attendance',
  'seo.p3':
    'We believe that a {emph1}free attendance tracker{emphEnd} should actually be free. You won\'t find hidden paywalls, annoying ads, or credit card requirements here. Our mission is to provide a {emph2}free student attendance tracking system{emphEnd} that helps students succeed without adding another subscription to their monthly bills. With {emph3}attendance online free{emphEnd}, you can access your dashboard from any device, anywhere.',
  'seo.h3.features': 'Features of Our Online Attendance for Students',
  'seo.feature1.title': 'Free Student Attendance Tracking System:',
  'seo.feature1.body': 'Get started without paying a dime. We offer a {emph1}free student attendance tracker{emphEnd} that is more powerful than paid alternatives.',
  'seo.feature2.title': 'Daily Habit Loop:',
  'seo.feature2.body': 'Log your classes in under 30 seconds. Our {emph1}online attendance for students{emphEnd} is optimized for speed and daily use.',
  'seo.feature3.title': 'Bunk Calculator:',
  'seo.feature3.body': 'The most loved feature by students. See your "bunk budget" per subject. No more manual calculations on the back of your notebook.',
  'seo.feature4.title': 'Comprehensive Online Attendance Monitoring System:',
  'seo.feature4.body': 'View detailed logs, subject-wise percentages, and overall progress bars. It is a {emph1}free online attendance monitoring system{emphEnd} that keeps you informed.',
  'seo.h3.school': 'The Best Attendance Tracker for School Free',
  'seo.p4':
    'Unlike a static {emph1}attendance tracking sheet{emphEnd}, our app is dynamic. If a class is cancelled or you have a holiday, you can mark the day as "Off," and it won\'t negatively impact your attendance percentage. This makes it an ideal {emph2}attendance tracker for school free{emphEnd} of cost and full of features. For those studying from home, it serves as a robust {emph3}homeschool attendance tracker{emphEnd}, allowing you to maintain discipline and track progress across various subjects and activities.',
  'seo.h3.conclusion': 'Conclusion: Start Using Your Online Attendance Tracker Today',
  'seo.p5':
    "Stop worrying about the math and start focusing on what matters. Use the {emph1}easiest way to track attendance{emphEnd} and keep your record clean. Built for everyone — join thousands who have made {emph2}my attendance tracker{emphEnd} their daily companion.",

  // About page
  'about.h1': 'About Attendance Tracker',
  'about.p1': 'We built Attendance Tracker because every other "attendance calculator" is a stateless widget. You paste two numbers, get a percentage, and forget the site exists.',
  'about.p2': "Real students live in a timetable. Monday 9am is always Calculus. The hard part of tracking attendance isn't the math — it's the daily logging. So we built a tool that knows your schedule, turns the question into one tap, and shows you what to do next.",
  'about.principles.h2': 'Our principles',
  'about.principle1': '{strong1}Free, forever.{strongEnd} No paywall, no Pro tier, no ads.',
  'about.principle2': '{strong1}Private by default.{strongEnd} Your data is yours. Export and delete with one click.',
  'about.principle3': '{strong1}Fast and accessible.{strongEnd} Works on a 2G connection, on a low-end Android, with a screen reader.',
  'about.principle4': '{strong1}Honest math.{strongEnd} We show our assumptions (target %, day overrides) instead of hiding them.',

  // Contact page
  'contact.h1': 'Contact us',
  'contact.p1': "We'd love to hear from you — bug reports, feature ideas, or just a hello. Pick whichever channel works for you.",
  'contact.emailLabel': 'Email',
  'contact.emailResponse': 'We respond within 2 business days.',
  'contact.bugLabel': 'Report a bug',
  'contact.bugBody': 'Found something broken? Include a screenshot and the steps to reproduce. The fastest fix comes from a clear repro.',
  'contact.featureLabel': 'Feature request',
  'contact.featureBody': 'We read every request. The most-requested ones get built first.',
  'contact.privacyLabel': 'Privacy & data',
  'contact.privacyBody':
    'For data deletion, export, or any privacy question, see our {emph1}Privacy Policy{emphEnd} or email us.',
  'contact.privacyLink': 'Privacy Policy',
  'contact.headsUp':
    '{strong1}Heads-up:{strongEnd} the Attendance Tracker is a small, student-built project. We do our best to respond quickly, but if your issue is blocking an exam or a deadline, please fall back to your institution\'s official record first.',

  // Privacy page
  'privacy.h1': 'Privacy Policy',
  'privacy.lastUpdated': 'Last updated: {date}',
  'privacy.h2.collect': 'What we collect',
  'privacy.p1':
    'Your name, email, and the data you create: academic sessions, subjects, timetable slots, daily attendance logs, and day overrides. That\'s it.',
  'privacy.h2.dontDo': "What we don't do",
  'privacy.bullet1': "We don't sell your data. Period.",
  'privacy.bullet2': "We don't run third-party advertising trackers.",
  'privacy.bullet3': "We don't log your IP beyond what's needed for rate limiting.",
  'privacy.h2.cookies': 'Cookies',
  'privacy.cookiesP':
    'We use a single first-party session cookie for authentication, plus a `localStorage` key for your theme preference. No third-party cookies.',
  'privacy.h2.rights': 'Your rights',
  'privacy.rightsP':
    'You can export everything you stored as JSON or CSV at any time from {emph1}Settings{emphEnd}. You can delete your account from the same place; deletion is hard and immediate.',
  'privacy.rightsLink': 'Settings',
  'privacy.h2.contact': 'Contact',
  'privacy.contactP':
    'Questions? Email {emph1}hello@attendancetrack75.com{emphEnd}.',

  // Terms page
  'terms.h1': 'Terms of Service',
  'terms.lastUpdated': 'Last updated: {date}',
  'terms.intro':
    "Attendance Tracker is a free tool provided as-is. By using it, you agree to enter your own data accurately. The percentage calculations are estimates — your college's official record is the source of truth.",
  'terms.h2.warranty': 'No warranty',
  'terms.warrantyP':
    "We do our best to keep the math correct, but we can't guarantee the tool is error-free. Always cross-check critical decisions with your institution's records.",
  'terms.h2.acceptable': 'Acceptable use',
  'terms.acceptableP':
    "Don't abuse the service (bots, scraping, denial-of-service). We may rate-limit or block abusive traffic.",
  'terms.h2.changes': 'Changes',
  'terms.changesP':
    'We may update these terms. The "Last updated" date will reflect changes.',
};

const hi: Dict = {
  // Phase 1: spot translations for the most-visible chrome. Missing
  // entries fall back to English at runtime.
  'nav.today': 'आज का शेड्यूल',
  'nav.weekly': 'साप्ताहिक शेड्यूल',
  'nav.subjects': 'विषय',
  'nav.calculator': 'कैलकुलेटर',
  'nav.sessions': 'सत्र',
  'nav.settings': 'सेटिंग्स',
  'nav.tracker': 'ट्रैकर',
  'shell.logOut': 'लॉग आउट',
  'btn.back': 'वापस',
  'btn.continue': 'जारी रखें',
  'btn.continueAsGuest': 'अतिथि के रूप में जारी रखें',
  'btn.loginAsGuest': 'अतिथि के रूप में लॉगिन',
  'btn.continuing': 'जारी है…',
  'btn.save': 'सहेजें',
  'btn.saving': 'सहेज रहा है…',
  'btn.saveAndContinue': 'सहेजें और जारी रखें',
  'btn.createAccount': 'खाता बनाएं',
  'btn.logIn': 'लॉग इन',
  'btn.getStarted': 'शुरू करें',
  'btn.skipForNow': 'अभी छोड़ें',
  'auth.login.title': 'वापसी पर स्वागत है',
  'auth.login.subtitle': 'अपनी लकीर बनाए रखने के लिए लॉग इन करें।',
  'auth.signup.title': 'अपना खाता बनाएं',
  'auth.signup.subtitle': 'एक मिनट से भी कम में ट्रैकिंग शुरू करें।',
  'landing.headline1': 'सबसे आसान तरीका',
  'landing.headline2': 'उपस्थिति ट्रैक करने का।',
  'landing.ctaPrimary': 'मेरा उपस्थिति ट्रैकर शुरू करें — मुफ़्त',
  'landing.ctaBottomButton': 'मुफ़्त ट्रैकिंग शुरू करें',
  'today.title': 'आज',
  'today.overall': 'कुल उपस्थिति',

  // FAQ (phase 2)
  'faq.title': 'छात्र हमारे मुफ़्त उपस्थिति ट्रैकर को क्यों पसंद करते हैं',
  'faq.subtitle': 'छात्र मुफ़्त उपस्थिति ट्रैकर के बारे में जो कुछ भी पूछते हैं।',
  'faq.q1': 'क्या यह उपस्थिति ट्रैकर सच में मुफ़्त है?',
  'faq.a1': 'हाँ — 100% मुफ़्त, कोई क्रेडिट कार्ड नहीं, कोई ट्रायल नहीं, कोई छिपा शुल्क नहीं। आप हमारे मुफ़्त उपस्थिति ट्रैकर का उपयोग अपनी कक्षाएं दर्ज करने, साप्ताहिक शेड्यूल बनाने और जब चाहें अपना प्रतिशत देखने के लिए कर सकते हैं। भुगतान वाला संस्करण वही है; हम किसी सुविधा को सदस्यता के पीछे नहीं छिपाते।',
  'faq.q2': 'छात्र के रूप में मैं अपनी उपस्थिति कैसे ट्रैक करूं?',
  'faq.a2': 'साइन अप करें, अपने विषय और लैब जोड़ें, अपनी साप्ताहिक टाइमटेबल पेस्ट करें या बनाएं, फिर प्रत्येक कक्षा को उपस्थित, अनुपस्थित या ऑफ के रूप में चिह्नित करें। हमारा छात्र उपस्थिति ट्रैकर आपके लिए प्रतिशत की गणना करता है और बताता है कि आप अपने लक्ष्य से नीचे गिरे बिना प्रति विषय कितनी और कक्षाएं छोड़ सकते हैं।',
  'faq.q3': 'क्या मैं अपने फ़ोन से ऑनलाइन उपस्थिति ट्रैकर का उपयोग कर सकता हूं?',
  'faq.a3': 'हाँ। हमारा छात्र उपस्थिति ट्रैकर ऑनलाइन किसी भी आधुनिक ब्राउज़र में, किसी भी डिवाइस पर — फ़ोन, टैबलेट या लैपटॉप — काम करता है। कुछ भी डाउनलोड या इंस्टॉल करने की ज़रूरत नहीं। एक बार साइन इन करें और आपका डेटा आपके साथ रहता है।',
  'faq.q4': 'क्या कोई उपस्थिति ट्रैकर ऐप है जिसे मैं डाउनलोड कर सकता हूं?',
  'faq.a4': 'आपको किसी की ज़रूरत नहीं है। हमारा वेब ऐप एक पूर्ण उपस्थिति ट्रैकर ऐप है जिसे आप एक टैप में अपने फ़ोन की होम स्क्रीन पर पिन कर सकते हैं, इसलिए यह एक ऐप स्टोर से मुफ़्त डाउनलोड की तरह व्यवहार करता है। आपको वही गति, पूर्ण-स्क्रीन अनुभव और ऑफ़लाइन-अनुकूल एहसास मिलता है।',
  'faq.q5': '75% उपस्थिति मानदंड ट्रैकर कैसे काम करता है?',
  'faq.a5': 'अधिकांश भारतीय कॉलेज और कई अंतरराष्ट्रीय विश्वविद्यालय अनिवार्य 75% उपस्थिति नियम लागू करते हैं। हमारी 75% मानदंड सुविधा आपको प्रति सत्र एक कस्टम लक्ष्य (50–100%) निर्धारित करने देती है और तुरंत आपका वर्तमान प्रतिशत, आपने कितनी कक्षाएं ली हैं और आप कितनी और छोड़ सकते हैं दिखाती है। हम 80% लक्ष्य का भी समर्थन करते हैं — 50 से 100 के बीच कुछ भी।',
  'faq.q6': 'हर दिन उपस्थिति ट्रैक करने का सबसे आसान तरीका क्या है?',
  'faq.a6': 'आज पृष्ठ खोलें, दिन की कक्षाओं को देखें, और प्रत्येक विषय के लिए +, −, या ऑफ टैप करें। पूरी प्रक्रिया 30 सेकंड से कम में हो जाती है। यह उपस्थिति ट्रैक करने का सबसे आसान तरीका है क्योंकि आपको बाद में कुछ भी याद नहीं रखना होता — दिन, समय और विषय पहले से ही आपकी साप्ताहिक टाइमटेबल से भरे होते हैं।',
  'faq.q7': 'क्या मैं इसे स्कूल के लिए उपस्थिति ट्रैकर के रूप में उपयोग कर सकता हूं?',
  'faq.a7': 'बिल्कुल। हालाँकि ऐप कॉलेज-शैली की साप्ताहिक टाइमटेबल के आसपास डिज़ाइन किया गया है, यह स्कूल के लिए मुफ़्त उपस्थिति ट्रैकर के रूप में भी उतना ही अच्छा काम करता है। अपने विषय जोड़ें, टाइमटेबल सेट करें और चिह्नित करना शुरू करें। विषयों या सत्रों की संख्या की कोई सीमा नहीं है।',
  'faq.q8': 'क्या बिना साइनअप के मुफ़्त छात्र उपस्थिति ट्रैकिंग सिस्टम है?',
  'faq.a8': 'आप खाता बनाए बिना अतिथि के रूप में ऐप आज़मा सकते हैं, लेकिन अपना डेटा डिवाइस और सत्रों में रखने के लिए ईमेल से साइन अप करने में केवल 10 सेकंड लगते हैं। दोनों तरीकों से, आपको पूरा मुफ़्त छात्र उपस्थिति ट्रैकिंग सिस्टम मिलता है — कोई भी सुविधा खाते के पीछे बंद नहीं है।',
  'faq.q9': 'क्या मैं अपनी उपस्थिति शीट साझा कर सकता हूं या निर्यात कर सकता हूं?',
  'faq.a9': 'आपका डेटा आपके खाते में रहता है और आप इसे कभी भी डैशबोर्ड, साप्ताहिक दृश्य या प्रति-विषय दृश्य में देख सकते हैं। मुद्रण योग्य उपस्थिति ट्रैकिंग शीट पर निर्यात रोडमैप पर है — अभी के लिए, ऐप के भीतर के दृश्य एक नज़र में हर रिपोर्ट कवर करते हैं।',
  'faq.q10': 'क्या यह कर्मचारी उपस्थिति ट्रैकर के रूप में काम करता है?',
  'faq.a10': 'ऐप शैक्षणिक सप्ताह चक्र (सोम–रवि टाइमटेबल, लैब, प्रतिशत लक्ष्य) के लिए बनाया गया है, इसलिए यह एचआर / पेरोल अर्थ में कर्मचारी उपस्थिति ट्रैकर नहीं है। यदि आप अपने कार्य छुट्टियों का व्यक्तिगत रिकॉर्ड चाहते हैं, तो आप इसे उस तरह से उपयोग कर सकते हैं, लेकिन टाइमकार्ड, पीटीओ और पेरोल के लिए आपको एक समर्पित वर्कफ़ोर्स टूल चाहिए।',
  'faq.q11': 'स्प्रेडशीट या उपस्थिति ट्रैकिंग शीट से आपकी तुलना कैसे होती है?',
  'faq.a11': 'छात्र उपस्थिति ट्रैकिंग स्प्रेडशीट तब तक काम करती है जब तक आपको उपस्थित दिनों की गिनती नहीं करनी, लैब को वेट नहीं करना, या छुट्टियाँ याद नहीं रखनी। हमारा ऐप स्वचालित रूप से गिनती, प्रतिशत गणित, लैब वेटिंग और छुट्टी का पता लगाना करता है — और यह आपके फ़ोन पर काम करता है, जो स्प्रेडशीट आमतौर पर नहीं करती।',

  // Marketing long-form (phase 2)
  'seo.h2': 'छात्रों के लिए अंतिम ऑनलाइन उपस्थिति ट्रैकर',
  'seo.p1': '{emph1}उपस्थिति ट्रैक करने का सबसे आसान तरीका{emphEnd} ढूंढना कोई कठिन काम नहीं होना चाहिए। चाहे आप कठोर कटऑफ नियमों वाले कॉलेज छात्र हों या {emph2}होमस्कूल उपस्थिति ट्रैकर{emphEnd} की तलाश में अभिभावक, हमारा टूल आपके शैक्षणिक जीवन को सरल बनाने के लिए बनाया गया है। आज की तेज़-रफ़्तार शैक्षणिक वातावरण में कागज़ी लॉग या जटिल स्प्रेडशीट का उपयोग करके मैन्युअल रूप से {emph3}छात्र उपस्थिति ट्रैक करना{emphEnd} पुराना और त्रुटि-प्रवण है। हमारा {emph4}ऑनलाइन उपस्थिति सिस्टम{emphEnd} एक सहज, डिजिटल विकल्प प्रदान करता है जो आपकी जेब में फिट हो जाता है।',
  'seo.h3.app': 'छात्र उपस्थिति ट्रैकर ऐप का उपयोग क्यों करें?',
  'seo.p2': 'अधिकांश विश्वविद्यालय अनिवार्य 75% उपस्थिति नियम लागू करते हैं। इससे नीचे गिरने का मतलब परीक्षाओं से वंचित होना या छात्रवृत्ति खोना हो सकता है। हमारा {emph1}छात्र उपस्थिति ट्रैकर{emphEnd} विशेष रूप से इस चुनौती के लिए डिज़ाइन किया गया है। यह केवल दिनों की गिनती नहीं करता; यह आपके लिए भारी गणित करता है। {emph2}मेरा उपस्थिति ट्रैकर{emphEnd} का उपयोग करके, आप अपने लक्ष्य प्रतिशत से नीचे गिरे बिना प्रत्येक विषय के लिए कितनी कक्षाएं छोड़ सकते हैं, यह एक नज़र में देख सकते हैं।',
  'seo.h3.free': '100% मुफ़्त छात्र उपस्थिति',
  'seo.p3': 'हमारा मानना है कि एक {emph1}मुफ़्त उपस्थिति ट्रैकर{emphEnd} वास्तव में मुफ़्त होना चाहिए। आपको यहाँ छिपे हुए पे-वॉल, कष्टप्रद विज्ञापन या क्रेडिट कार्ड की आवश्यकता नहीं मिलेगी। हमारा मिशन एक {emph2}मुफ़्त छात्र उपस्थिति ट्रैकिंग सिस्टम{emphEnd} प्रदान करना है जो छात्रों को उनके मासिक बिलों में एक और सदस्यता जोड़े बिना सफल होने में मदद करता है। {emph3}मुफ़्त ऑनलाइन उपस्थिति{emphEnd} के साथ, आप कहीं से भी, किसी भी डिवाइस से अपने डैशबोर्ड तक पहुँच सकते हैं।',
  'seo.h3.features': 'छात्रों के लिए हमारी ऑनलाइन उपस्थिति की विशेषताएं',
  'seo.feature1.title': 'मुफ़्त छात्र उपस्थिति ट्रैकिंग सिस्टम:',
  'seo.feature1.body': 'बिना एक पैसा दिए शुरू करें। हम एक {emph1}मुफ़्त छात्र उपस्थिति ट्रैकर{emphEnd} प्रदान करते हैं जो भुगतान वाले विकल्पों से अधिक शक्तिशाली है।',
  'seo.feature2.title': 'दैनिक आदत लूप:',
  'seo.feature2.body': 'अपनी कक्षाएं 30 सेकंड से कम में दर्ज करें। हमारा {emph1}छात्रों के लिए ऑनलाइन उपस्थिति{emphEnd} गति और दैनिक उपयोग के लिए अनुकूलित है।',
  'seo.feature3.title': 'बंक कैलकुलेटर:',
  'seo.feature3.body': 'छात्रों द्वारा सबसे अधिक पसंद की जाने वाली सुविधा। प्रति विषय अपना "बंक बजट" देखें। अपनी नोटबुक के पीछे कोई मैन्युअल गणना नहीं।',
  'seo.feature4.title': 'व्यापक ऑनलाइन उपस्थिति निगरानी प्रणाली:',
  'seo.feature4.body': 'विस्तृत लॉग, विषय-वार प्रतिशत और समग्र प्रगति बार देखें। यह एक {emph1}मुफ़्त ऑनलाइन उपस्थिति निगरानी प्रणाली{emphEnd} है जो आपको सूचित रखती है।',
  'seo.h3.school': 'स्कूल के लिए सबसे अच्छा मुफ़्त उपस्थिति ट्रैकर',
  'seo.p4': 'एक स्थिर {emph1}उपस्थिति ट्रैकिंग शीट{emphEnd} के विपरीत, हमारा ऐप गतिशील है। यदि कोई कक्षा रद्द हो जाती है या आपकी छुट्टी है, तो आप दिन को "ऑफ" के रूप में चिह्नित कर सकते हैं, और यह आपके उपस्थिति प्रतिशत पर नकारात्मक प्रभाव नहीं डालेगा। यह इसे लागत-मुक्त और सुविधाओं से भरपूर {emph2}मुफ़्त स्कूल उपस्थिति ट्रैकर{emphEnd} बनाता है। जो लोग घर से पढ़ रहे हैं, उनके लिए यह एक मजबूत {emph3}होमस्कूल उपस्थिति ट्रैकर{emphEnd} के रूप में कार्य करता है, जो आपको अनुशासन बनाए रखने और विभिन्न विषयों और गतिविधियों में प्रगति ट्रैक करने की अनुमति देता है।',
  'seo.h3.conclusion': 'निष्कर्ष: आज ही अपना ऑनलाइन उपस्थिति ट्रैकर उपयोग करना शुरू करें',
  'seo.p5': 'गणित की चिंता करना बंद करें और जो मायने रखता है उस पर ध्यान देना शुरू करें। {emph1}उपस्थिति ट्रैक करने का सबसे आसान तरीका{emphEnd} उपयोग करें और अपना रिकॉर्ड साफ़ रखें। सभी के लिए बनाया गया — हज़ारों लोगों से जुड़ें जिन्होंने {emph2}मेरा उपस्थिति ट्रैकर{emphEnd} को अपना दैनिक साथी बनाया है।',

  // About page
  'about.h1': 'अटेंडेंस ट्रैकर के बारे में',
  'about.p1': 'हमने अटेंडेंस ट्रैकर इसलिए बनाया क्योंकि हर अन्य "उपस्थिति कैलकुलेटर" एक स्टेटलेस विजेट है। आप दो नंबर पेस्ट करते हैं, एक प्रतिशत प्राप्त करते हैं, और साइट को भूल जाते हैं।',
  'about.p2': 'असली छात्र एक टाइमटेबल में रहते हैं। सोमवार सुबह 9 बजे हमेशा कैलकुलस होता है। उपस्थिति ट्रैक करने का कठिन हिस्सा गणित नहीं है — यह दैनिक लॉगिंग है। इसलिए हमने एक ऐसा टूल बनाया है जो आपका शेड्यूल जानता है, सवाल को एक टैप में बदल देता है, और आपको बताता है कि आगे क्या करना है।',
  'about.principles.h2': 'हमारे सिद्धांत',
  'about.principle1': '{strong1}हमेशा मुफ़्त।{strongEnd} कोई पे-वॉल नहीं, कोई प्रो टियर नहीं, कोई विज्ञापन नहीं।',
  'about.principle2': '{strong1}डिफ़ॉल्ट रूप से निजी।{strongEnd} आपका डेटा आपका है। एक क्लिक में निर्यात और हटाएं।',
  'about.principle3': '{strong1}तेज़ और सुलभ।{strongEnd} 2G कनेक्शन पर, कम-स्तर के Android पर, स्क्रीन रीडर के साथ काम करता है।',
  'about.principle4': '{strong1}ईमानदार गणित।{strongEnd} हम अपनी मान्यताओं (लक्ष्य %, दिन ओवरराइड) दिखाते हैं उन्हें छिपाने के बजाय।',

  // Contact page
  'contact.h1': 'हमसे संपर्क करें',
  'contact.p1': 'हम आपसे सुनना पसंद करेंगे — बग रिपोर्ट, सुविधा विचार, या बस एक नमस्ते। जो भी चैनल आपके लिए काम करे उसे चुनें।',
  'contact.emailLabel': 'ईमेल',
  'contact.emailResponse': 'हम 2 व्यावसायिक दिनों के भीतर जवाब देते हैं।',
  'contact.bugLabel': 'बग रिपोर्ट करें',
  'contact.bugBody': 'कुछ टूटा हुआ मिला? स्क्रीनशॉट और पुनरुत्पादन के चरण शामिल करें। सबसे तेज़ समाधान एक स्पष्ट पुनरुत्पादन से आता है।',
  'contact.featureLabel': 'सुविधा अनुरोध',
  'contact.featureBody': 'हम हर अनुरोध पढ़ते हैं। सबसे अधिक अनुरोधित सुविधाएं पहले बनाई जाती हैं।',
  'contact.privacyLabel': 'गोपनीयता और डेटा',
  'contact.privacyBody': 'डेटा हटाने, निर्यात करने या किसी गोपनीयता प्रश्न के लिए, हमारी {emph1}गोपनीयता नीति{emphEnd} देखें या हमें ईमेल करें।',
  'contact.privacyLink': 'गोपनीयता नीति',
  'contact.headsUp': '{strong1}ध्यान दें:{strongEnd} अटेंडेंस ट्रैकर एक छोटा, छात्र-निर्मित प्रोजेक्ट है। हम जल्दी जवाब देने की पूरी कोशिश करते हैं, लेकिन अगर आपका मुद्दा किसी परीक्षा या समय सीमा को रोक रहा है, तो कृपया पहले अपने संस्थान के आधिकारिक रिकॉर्ड पर वापस जाएं।',

  // Privacy page
  'privacy.h1': 'गोपनीयता नीति',
  'privacy.lastUpdated': 'अंतिम अद्यतन: {date}',
  'privacy.h2.collect': 'हम क्या एकत्र करते हैं',
  'privacy.p1': 'आपका नाम, ईमेल, और आपके द्वारा बनाया गया डेटा: शैक्षणिक सत्र, विषय, टाइमटेबल स्लॉट, दैनिक उपस्थिति लॉग और दिन ओवरराइड। बस।',
  'privacy.h2.dontDo': 'हम क्या नहीं करते',
  'privacy.bullet1': 'हम आपका डेटा नहीं बेचते। बिंदु।',
  'privacy.bullet2': 'हम तीसरे पक्ष के विज्ञापन ट्रैकर नहीं चलाते।',
  'privacy.bullet3': 'हम दर सीमा के लिए आवश्यक से अधिक आपका IP लॉग नहीं करते।',
  'privacy.h2.cookies': 'कुकीज़',
  'privacy.cookiesP': 'हम प्रमाणीकरण के लिए एक ही प्रथम-पक्ष सत्र कुकी का उपयोग करते हैं, साथ ही आपकी थीम प्राथमिकता के लिए एक `localStorage` कुंजी। कोई तीसरे पक्ष की कुकीज़ नहीं।',
  'privacy.h2.rights': 'आपके अधिकार',
  'privacy.rightsP': 'आप {emph1}सेटिंग्स{emphEnd} से किसी भी समय JSON या CSV के रूप में अपना सारा डेटा निर्यात कर सकते हैं। आप उसी स्थान से अपना खाता हटा सकते हैं; विलोपन कठिन और तत्काल है।',
  'privacy.rightsLink': 'सेटिंग्स',
  'privacy.h2.contact': 'संपर्क',
  'privacy.contactP': 'प्रश्न? ईमेल करें {emph1}hello@attendancetrack75.com{emphEnd}।',

  // Terms page
  'terms.h1': 'सेवा की शर्तें',
  'terms.lastUpdated': 'अंतिम अद्यतन: {date}',
  'terms.intro': 'अटेंडेंस ट्रैकर एक मुफ़्त टूल है जो जैसा है वैसा प्रदान किया गया है। इसका उपयोग करके, आप अपना डेटा सटीक रूप से दर्ज करने पर सहमत होते हैं। प्रतिशत गणना अनुमान हैं — आपके कॉलेज का आधिकारिक रिकॉर्ड स्रोत है।',
  'terms.h2.warranty': 'कोई वारंटी नहीं',
  'terms.warrantyP': 'हम गणित को सही रखने की पूरी कोशिश करते हैं, लेकिन हम टूल को त्रुटि-मुक्त होने की गारंटी नहीं दे सकते। महत्वपूर्ण निर्णयों को हमेशा अपने संस्थान के रिकॉर्ड से क्रॉस-चेक करें।',
  'terms.h2.acceptable': 'स्वीकार्य उपयोग',
  'terms.acceptableP': 'सेवा का दुरुपयोग न करें (बॉट, स्क्रैपिंग, डिनायल-ऑफ-सर्विस)। हम दुरुपयोग करने वाले ट्रैफ़िक को दर-सीमित या ब्लॉक कर सकते हैं।',
  'terms.h2.changes': 'परिवर्तन',
  'terms.changesP': 'हम इन शर्तों को अपडेट कर सकते हैं। "अंतिम अद्यतन" तिथि परिवर्तनों को दर्शाएगी।',
};

const es: Dict = {
  'nav.today': 'Horario de hoy',
  'nav.weekly': 'Horario semanal',
  'nav.subjects': 'Asignaturas',
  'nav.calculator': 'Calculadora',
  'nav.sessions': 'Sesiones',
  'nav.settings': 'Ajustes',
  'nav.tracker': 'Tracker',
  'shell.logOut': 'Cerrar sesión',
  'btn.back': 'Atrás',
  'btn.continue': 'Continuar',
  'btn.continueAsGuest': 'Continuar como invitado',
  'btn.loginAsGuest': 'Iniciar como invitado',
  'btn.continuing': 'Continuando…',
  'btn.save': 'Guardar',
  'btn.saving': 'Guardando…',
  'btn.saveAndContinue': 'Guardar y continuar',
  'btn.createAccount': 'Crear cuenta',
  'btn.logIn': 'Iniciar sesión',
  'btn.getStarted': 'Empezar',
  'btn.skipForNow': 'Omitir por ahora',
  'auth.login.title': 'Bienvenido de vuelta',
  'auth.login.subtitle': 'Inicia sesión para mantener tu racha.',
  'auth.signup.title': 'Crea tu cuenta',
  'auth.signup.subtitle': 'Empieza a registrar en menos de un minuto.',
  'landing.headline1': 'La forma más fácil de',
  'landing.headline2': 'registrar la asistencia.',
  'landing.ctaPrimary': 'Empezar mi registro de asistencia — Gratis',
  'landing.ctaBottomButton': 'Empezar a registrar gratis',
  'today.title': 'Hoy',
  'today.overall': 'Asistencia total',

  // FAQ (phase 2)
  'faq.title': 'Por qué los estudiantes aman nuestro registro de asistencia gratis',
  'faq.subtitle': 'Todo lo que preguntan los estudiantes sobre el registro de asistencia gratis.',
  'faq.q1': '¿Este registro de asistencia es realmente gratis?',
  'faq.a1': 'Sí — 100% gratis, sin tarjeta de crédito, sin prueba, sin muros de pago ocultos. Puedes usar nuestro registro de asistencia gratis para registrar tus clases, crear tu horario semanal y ver tu porcentaje acumulado todo el tiempo que quieras. La versión de pago es la misma versión; no bloqueamos funciones detrás de una suscripción.',
  'faq.q2': '¿Cómo registro mi asistencia como estudiante?',
  'faq.a2': 'Regístrate, añade las asignaturas y labs que curses, pega o crea tu horario semanal, y marca cada clase como presente, ausente o libre. Nuestro registro de asistencia para estudiantes hace el cálculo del porcentaje por ti y te dice exactamente cuántas clases más puedes faltar por asignatura sin bajar de tu objetivo.',
  'faq.q3': '¿Puedo usar este registro de asistencia online desde el móvil?',
  'faq.a3': 'Sí. Nuestro registro de asistencia para estudiantes online funciona en cualquier navegador moderno, en cualquier dispositivo — móvil, tablet o portátil. No hay nada que descargar ni instalar. Inicia sesión una vez y tus datos te siguen.',
  'faq.q4': '¿Hay una app de registro de asistencia que pueda descargar?',
  'faq.a4': 'No la necesitas. Nuestra web es una app completa de registro de asistencia que puedes anclar a la pantalla de inicio de tu móvil con un toque, así se comporta como una app nativa sin obligarte a descargar gratis de una tienda de apps. Obtienes la misma velocidad, experiencia a pantalla completa y sensación apta para uso offline.',
  'faq.q5': '¿Cómo funciona el registro del 75% de asistencia?',
  'faq.a5': 'La mayoría de universidades y varios centros internacionales aplican una regla obligatoria del 75% de asistencia. Nuestra función de registro del 75% te permite fijar un objetivo personalizado por sesión (50–100%) y muestra al instante tu porcentaje actual, cuántas clases has asistido y cuántas puedes seguir faltando. También admitimos objetivos del 80% — cualquier valor entre 50 y 100.',
  'faq.q6': '¿Cuál es la forma más fácil de registrar la asistencia cada día?',
  'faq.a6': 'Abre la página Hoy, mira las clases del día y toca +, −, o Libre para cada asignatura. Todo el proceso lleva menos de 30 segundos. Es la forma más fácil de registrar asistencia porque no tienes que recordar nada después — el día, la hora y la asignatura ya están rellenados desde tu horario semanal.',
  'faq.q7': '¿Puedo usar esto como registro de asistencia para el colegio?',
  'faq.a7': 'Por supuesto. Aunque la app está diseñada en torno al horario semanal de universidad, también funciona perfectamente como registro de asistencia para colegio gratis. Añade tus asignaturas, define tu horario y empieza a marcar. No hay límite en el número de asignaturas o sesiones.',
  'faq.q8': '¿Hay un sistema gratis de registro de asistencia para estudiantes sin registro?',
  'faq.a8': 'Puedes probar la app como invitado sin crear una cuenta, pero para mantener tus datos entre dispositivos y sesiones, registrarte con un correo lleva 10 segundos. En cualquier caso, obtienes el sistema completo de registro de asistencia para estudiantes gratis — ninguna función está bloqueada detrás de una cuenta.',
  'faq.q9': '¿Puedo compartir mi hoja de asistencia o exportarla?',
  'faq.a9': 'Tus datos viven en tu cuenta y puedes revisarlos en cualquier momento en el panel, la vista semanal o la vista por asignatura. La exportación a una hoja de asistencia imprimible está en la hoja de ruta — por ahora, las vistas dentro de la app cubren cada informe que necesitarías ver de un vistazo.',
  'faq.q10': '¿Funciona como registro de asistencia para empleados?',
  'faq.a10': 'La app está hecha para el ciclo académico semanal (horario lun–dom, labs, objetivos por porcentaje), así que no es un registro de asistencia para empleados en el sentido de nóminas / RR. HH. Si quieres un registro personal de tus días libres laborales, puedes usarla así, pero para tarjetas de tiempo, PTO y nóminas querrás una herramienta específica de gestión de personal.',
  'faq.q11': '¿Cómo se compara con una hoja de cálculo o una hoja de registro de asistencia?',
  'faq.a11': 'Una hoja de cálculo de registro de asistencia de estudiantes funciona hasta que tienes que contar días presentes, ponderar labs o recordar festivos. Nuestra app hace el conteo, el cálculo del porcentaje, la ponderación de labs y la detección de festivos automáticamente — y funciona en tu móvil, cosa que una hoja de cálculo normalmente no.',

  // Marketing long-form (phase 2)
  'seo.h2': 'El mejor registro de asistencia online para estudiantes',
  'seo.p1': 'Encontrar la {emph1}forma más fácil de registrar asistencia{emphEnd} no debería ser una tarea pesada. Tanto si eres un estudiante universitario con reglas estrictas de corte como si eres un padre en busca de un {emph2}registro de asistencia para homeschooling{emphEnd}, nuestra herramienta está diseñada para simplificar tu vida académica. En el vertiginoso entorno educativo actual, {emph3}registrar la asistencia de los estudiantes{emphEnd} manualmente con hojas de papel o hojas de cálculo complicadas está obsoleto y es propenso a errores. Nuestro {emph4}sistema de asistencia online{emphEnd} ofrece una alternativa digital y sin fisuras que cabe en tu bolsillo.',
  'seo.h3.app': '¿Por qué usar una app de registro de asistencia para estudiantes?',
  'seo.p2': 'La mayoría de las universidades aplican una regla obligatoria del 75% de asistencia. Caer por debajo puede significar que te prohíban presentarte a exámenes o perder becas. Nuestro {emph1}registro de asistencia para estudiantes{emphEnd} está diseñado precisamente para este reto. No solo cuenta días; hace por ti el cálculo pesado. Al usar {emph2}mi registro de asistencia{emphEnd}, puedes ver de un vistazo cuántas clases puedes permitirte faltar por asignatura sin caer por debajo de tu porcentaje objetivo.',
  'seo.h3.free': '100% asistencia gratis para estudiantes',
  'seo.p3': 'Creemos que un {emph1}registro de asistencia gratis{emphEnd} debería ser realmente gratis. No encontrarás muros de pago ocultos, anuncios molestos ni requisitos de tarjeta de crédito. Nuestra misión es ofrecer un {emph2}sistema de registro de asistencia para estudiantes gratis{emphEnd} que ayude a los estudiantes a tener éxito sin sumar otra suscripción a sus facturas mensuales. Con {emph3}asistencia online gratis{emphEnd}, puedes acceder a tu panel desde cualquier dispositivo y en cualquier lugar.',
  'seo.h3.features': 'Características de nuestra asistencia online para estudiantes',
  'seo.feature1.title': 'Sistema de registro de asistencia para estudiantes gratis:',
  'seo.feature1.body': 'Empieza sin pagar un céntimo. Ofrecemos un {emph1}registro de asistencia para estudiantes gratis{emphEnd} más potente que las alternativas de pago.',
  'seo.feature2.title': 'Bucle de hábito diario:',
  'seo.feature2.body': 'Registra tus clases en menos de 30 segundos. Nuestra {emph1}asistencia online para estudiantes{emphEnd} está optimizada para la velocidad y el uso diario.',
  'seo.feature3.title': 'Calculadora de faltas:',
  'seo.feature3.body': 'La función más querida por los estudiantes. Mira tu "presupuesto de faltas" por asignatura. Nada de cuentas a mano en el reverso de tu cuaderno.',
  'seo.feature4.title': 'Sistema integral de monitorización de asistencia online:',
  'seo.feature4.body': 'Consulta registros detallados, porcentajes por asignatura y barras de progreso global. Es un {emph1}sistema de monitorización de asistencia online gratis{emphEnd} que te mantiene informado.',
  'seo.h3.school': 'El mejor registro de asistencia para colegio gratis',
  'seo.p4': 'A diferencia de una {emph1}hoja de registro de asistencia{emphEnd} estática, nuestra app es dinámica. Si se cancela una clase o tienes festivo, puedes marcar el día como "Libre" y no impactará negativamente en tu porcentaje. Esto lo convierte en un {emph2}registro de asistencia para colegio gratis{emphEnd} lleno de funciones. Para quienes estudian en casa, funciona como un sólido {emph3}registro de asistencia para homeschooling{emphEnd}, permitiéndote mantener la disciplina y seguir el progreso en distintas asignaturas y actividades.',
  'seo.h3.conclusion': 'Conclusión: empieza a usar hoy tu registro de asistencia online',
  'seo.p5': 'Deja de preocuparte por las cuentas y céntrate en lo que importa. Usa la {emph1}forma más fácil de registrar asistencia{emphEnd} y mantén tu expediente limpio. Hecho para todos — únete a los miles que ya han hecho de {emph2}mi registro de asistencia{emphEnd} su compañero diario.',

  // About page
  'about.h1': 'Sobre Attendance Tracker',
  'about.p1': 'Construimos Attendance Tracker porque todas las demás "calculadoras de asistencia" son widgets sin estado. Pegas dos números, obtienes un porcentaje y olvidas que el sitio existe.',
  'about.p2': 'Los estudiantes de verdad viven dentro de un horario. El lunes a las 9 es siempre Cálculo. La parte difícil de registrar la asistencia no es el cálculo — es el registro diario. Así que construimos una herramienta que conoce tu horario, convierte la pregunta en un toque y te muestra qué hacer a continuación.',
  'about.principles.h2': 'Nuestros principios',
  'about.principle1': '{strong1}Gratis, para siempre.{strongEnd} Sin muro de pago, sin tier Pro, sin anuncios.',
  'about.principle2': '{strong1}Privado por defecto.{strongEnd} Tus datos son tuyos. Exporta y borra con un clic.',
  'about.principle3': '{strong1}Rápido y accesible.{strongEnd} Funciona con 2G, en un Android básico, con un lector de pantalla.',
  'about.principle4': '{strong1}Matemáticas honestas.{strongEnd} Mostramos nuestras suposiciones (% objetivo, excepciones) en lugar de ocultarlas.',

  // Contact page
  'contact.h1': 'Contáctanos',
  'contact.p1': 'Nos encantaría saber de ti — informes de errores, ideas de funciones o simplemente un saludo. Elige el canal que te resulte más cómodo.',
  'contact.emailLabel': 'Correo',
  'contact.emailResponse': 'Respondemos en un plazo de 2 días laborables.',
  'contact.bugLabel': 'Reportar un error',
  'contact.bugBody': '¿Has encontrado algo que no funciona? Incluye una captura y los pasos para reproducirlo. La solución más rápida viene de una reproducción clara.',
  'contact.featureLabel': 'Solicitar función',
  'contact.featureBody': 'Leemos cada solicitud. Las más solicitadas se construyen primero.',
  'contact.privacyLabel': 'Privacidad y datos',
  'contact.privacyBody': 'Para eliminación de datos, exportación o cualquier pregunta de privacidad, consulta nuestra {emph1}Política de privacidad{emphEnd} o escríbenos.',
  'contact.privacyLink': 'Política de privacidad',
  'contact.headsUp': '{strong1}Aviso:{strongEnd} Attendance Tracker es un proyecto pequeño, creado por estudiantes. Hacemos lo posible por responder rápido, pero si tu problema bloquea un examen o una fecha límite, recurre primero al registro oficial de tu institución.',

  // Privacy page
  'privacy.h1': 'Política de privacidad',
  'privacy.lastUpdated': 'Última actualización: {date}',
  'privacy.h2.collect': 'Qué recopilamos',
  'privacy.p1': 'Tu nombre, correo y los datos que creas: sesiones académicas, asignaturas, franjas de horario, registros diarios de asistencia y excepciones de días. Eso es todo.',
  'privacy.h2.dontDo': 'Lo que no hacemos',
  'privacy.bullet1': 'No vendemos tus datos. Punto.',
  'privacy.bullet2': 'No usamos rastreadores publicitarios de terceros.',
  'privacy.bullet3': 'No registramos tu IP más allá de lo necesario para limitar la tasa.',
  'privacy.h2.cookies': 'Cookies',
  'privacy.cookiesP': 'Usamos una sola cookie de sesión de primera parte para autenticación, más una clave en `localStorage` para tu preferencia de tema. Sin cookies de terceros.',
  'privacy.h2.rights': 'Tus derechos',
  'privacy.rightsP': 'Puedes exportar todo lo que has guardado en JSON o CSV en cualquier momento desde {emph1}Ajustes{emphEnd}. También puedes eliminar tu cuenta desde el mismo lugar; la eliminación es firme e inmediata.',
  'privacy.rightsLink': 'Ajustes',
  'privacy.h2.contact': 'Contacto',
  'privacy.contactP': '¿Preguntas? Escribe a {emph1}hello@attendancetrack75.com{emphEnd}.',

  // Terms page
  'terms.h1': 'Términos del servicio',
  'terms.lastUpdated': 'Última actualización: {date}',
  'terms.intro': 'Attendance Tracker es una herramienta gratuita ofrecida tal cual. Al usarla, aceptas introducir tus propios datos con precisión. Los cálculos de porcentaje son estimaciones — el registro oficial de tu universidad es la fuente de verdad.',
  'terms.h2.warranty': 'Sin garantía',
  'terms.warrantyP': 'Hacemos lo posible por mantener los cálculos correctos, pero no podemos garantizar que la herramienta esté libre de errores. Compara siempre las decisiones críticas con los registros de tu institución.',
  'terms.h2.acceptable': 'Uso aceptable',
  'terms.acceptableP': 'No abuses del servicio (bots, scraping, denegación de servicio). Podemos limitar la tasa o bloquear el tráfico abusivo.',
  'terms.h2.changes': 'Cambios',
  'terms.changesP': 'Podemos actualizar estos términos. La fecha de "Última actualización" reflejará los cambios.',
};

const fr: Dict = {
  'nav.today': "Programme d'aujourd'hui",
  'nav.weekly': 'Programme hebdomadaire',
  'nav.subjects': 'Matières',
  'nav.calculator': 'Calculatrice',
  'nav.sessions': 'Sessions',
  'nav.settings': 'Paramètres',
  'nav.tracker': 'Suivi',
  'shell.logOut': 'Se déconnecter',
  'btn.back': 'Retour',
  'btn.continue': 'Continuer',
  'btn.continueAsGuest': 'Continuer en invité',
  'btn.loginAsGuest': 'Connexion en invité',
  'btn.continuing': 'En cours…',
  'btn.save': 'Enregistrer',
  'btn.saving': 'Enregistrement…',
  'btn.saveAndContinue': 'Enregistrer et continuer',
  'btn.createAccount': 'Créer un compte',
  'btn.logIn': 'Se connecter',
  'btn.getStarted': 'Commencer',
  'btn.skipForNow': 'Passer pour le moment',
  'auth.login.title': 'Bon retour',
  'auth.login.subtitle': 'Connectez-vous pour garder votre série.',
  'auth.signup.title': 'Créez votre compte',
  'auth.signup.subtitle': 'Commencez à suivre en moins d’une minute.',
  'landing.headline1': 'La façon la plus simple de',
  'landing.headline2': 'suivre les présences.',
  'landing.ctaPrimary': 'Démarrer mon suivi — Gratuit',
  'landing.ctaBottomButton': 'Commencer le suivi gratuit',
  'today.title': "Aujourd'hui",
  'today.overall': 'Présence globale',

  // FAQ (phase 2)
  'faq.title': 'Pourquoi les étudiants adorent notre suivi de présence gratuit',
  'faq.subtitle': 'Tout ce que les étudiants demandent sur le suivi de présence gratuit.',
  'faq.q1': 'Ce suivi de présence est-il vraiment gratuit ?',
  'faq.a1': 'Oui — 100% gratuit, pas de carte bancaire, pas d’essai, pas de paywall caché. Vous pouvez utiliser notre suivi de présence gratuit pour enregistrer vos cours, construire votre planning hebdomadaire et consulter votre pourcentage en cours aussi longtemps que vous le souhaitez. La version payante est la même version ; nous ne cachons aucune fonctionnalité derrière un abonnement.',
  'faq.q2': 'Comment suivre ma présence en tant qu’étudiant ?',
  'faq.a2': 'Inscrivez-vous, ajoutez les matières et les TP que vous suivez, collez ou construisez votre planning hebdomadaire, puis marquez chaque cours comme présent, absent ou libre. Notre suivi de présence étudiant fait le calcul du pourcentage pour vous et vous indique exactement combien de cours vous pouvez encore manquer par matière sans passer sous votre objectif.',
  'faq.q3': 'Puis-je utiliser ce suivi de présence en ligne depuis mon téléphone ?',
  'faq.a3': 'Oui. Notre suivi de présence étudiant en ligne fonctionne dans n’importe quel navigateur moderne, sur n’importe quel appareil — téléphone, tablette ou ordinateur. Rien à télécharger, rien à installer. Connectez-vous une fois et vos données vous suivent.',
  'faq.q4': 'Existe-t-il une application de suivi de présence à télécharger ?',
  'faq.a4': 'Vous n’en avez pas besoin. Notre application web est un suivi de présence à part entière que vous pouvez épingler à l’écran d’accueil de votre téléphone d’un seul toucher, pour un comportement d’application native sans téléchargement depuis un store. Vous obtenez la même vitesse, l’expérience plein écran et la sensation hors-ligne.',
  'faq.q5': 'Comment fonctionne le suivi du critère 75% de présence ?',
  'faq.a5': 'La plupart des universités imposent une règle obligatoire de 75% de présence. Notre fonction de critère 75% vous permet de définir un objectif personnalisé par session (50–100%) et affiche instantanément votre pourcentage actuel, le nombre de cours suivis et ceux que vous pouvez encore manquer. Nous prenons aussi en charge les objectifs à 80% — tout entre 50 et 100.',
  'faq.q6': 'Quelle est la manière la plus simple de suivre la présence chaque jour ?',
  'faq.a6': 'Ouvrez la page Aujourd’hui, regardez les cours du jour et touchez +, −, ou Libre pour chaque matière. L’ensemble prend moins de 30 secondes. C’est la manière la plus simple de suivre la présence car vous n’avez rien à mémoriser ensuite — le jour, l’heure et la matière sont déjà remplis depuis votre planning hebdomadaire.',
  'faq.q7': 'Puis-je l’utiliser comme suivi de présence pour l’école ?',
  'faq.a7': 'Absolument. Bien que l’application soit conçue autour du planning hebdomadaire universitaire, elle fonctionne tout aussi bien comme suivi de présence pour l’école gratuit. Ajoutez vos matières, définissez votre planning et commencez à marquer. Il n’y a aucune limite au nombre de matières ou de sessions.',
  'faq.q8': 'Existe-t-il un système de suivi de présence étudiant gratuit sans inscription ?',
  'faq.a8': 'Vous pouvez essayer l’application en tant qu’invité sans créer de compte, mais pour conserver vos données d’un appareil à l’autre, s’inscrire avec un e-mail prend 10 secondes. Dans les deux cas, vous obtenez le système complet de suivi de présence étudiant gratuit — aucune fonctionnalité n’est verrouillée derrière un compte.',
  'faq.q9': 'Puis-je partager ou exporter ma feuille de présence ?',
  'faq.a9': 'Vos données vivent dans votre compte et vous pouvez les consulter à tout moment dans le tableau de bord, la vue hebdomadaire ou la vue par matière. L’export vers une feuille de présence imprimable est sur la feuille de route — pour l’instant, les vues intégrées couvrent tous les rapports dont vous auriez besoin en un coup d’œil.',
  'faq.q10': 'Cela fonctionne-t-il comme suivi de présence pour employés ?',
  'faq.a10': 'L’application est conçue pour le cycle hebdomadaire académique (planning lun–dim, TP, objectifs en pourcentage), donc ce n’est pas un suivi de présence employé au sens RH / paie. Si vous voulez un journal personnel de vos jours de repos, vous pouvez l’utiliser ainsi, mais pour les pointages, congés et paie il vous faudra un outil dédié.',
  'faq.q11': 'Comment vous comparez-vous à un tableur ou une feuille de suivi de présence ?',
  'faq.a11': 'Un tableur de suivi de présence étudiant fonctionne jusqu’à ce qu’il faille compter les jours présents, pondérer les TP ou se souvenir des jours fériés. Notre application fait le comptage, le calcul du pourcentage, la pondération des TP et la détection des jours fériés automatiquement — et elle fonctionne sur votre téléphone, ce qu’un tableur ne fait généralement pas.',

  // Marketing long-form (phase 2)
  'seo.h2': 'Le meilleur suivi de présence en ligne pour les étudiants',
  'seo.p1': 'Trouver la {emph1}manière la plus simple de suivre les présences{emphEnd} ne devrait pas être une corvée. Que vous soyez étudiant avec des règles de seuil strictes ou parent cherchant un {emph2}suivi de présence pour l’école à la maison{emphEnd}, notre outil est conçu pour simplifier votre vie scolaire. Dans l’environnement éducatif actuel, {emph3}suivre les présences des étudiants{emphEnd} à la main via des feuilles de papier ou des tableurs est dépassé et source d’erreurs. Notre {emph4}système de présence en ligne{emphEnd} offre une alternative numérique fluide qui tient dans votre poche.',
  'seo.h3.app': 'Pourquoi utiliser une application de suivi de présence étudiant ?',
  'seo.p2': 'La plupart des universités imposent une règle obligatoire de 75% de présence. Passer en dessous peut signifier l’interdiction de se présenter aux examens ou la perte d’une bourse. Notre {emph1}suivi de présence étudiant{emphEnd} est conçu pour ce défi. Il ne se contente pas de compter les jours ; il fait le calcul lourd pour vous. En utilisant {emph2}mon suivi de présence{emphEnd}, vous voyez d’un coup d’œil combien de cours vous pouvez vous permettre de manquer par matière sans tomber sous votre pourcentage cible.',
  'seo.h3.free': '100% de présence étudiante gratuite',
  'seo.p3': 'Nous croyons qu’un {emph1}suivi de présence gratuit{emphEnd} devrait l’être vraiment. Vous ne trouverez ni paywall caché, ni publicités agaçantes, ni demande de carte bancaire. Notre mission : proposer un {emph2}système de suivi de présence étudiant gratuit{emphEnd} qui aide les étudiants à réussir sans ajouter un nouvel abonnement à leurs factures. Avec {emph3}présence en ligne gratuite{emphEnd}, accédez à votre tableau de bord depuis n’importe quel appareil, partout.',
  'seo.h3.features': 'Fonctionnalités de notre présence en ligne pour étudiants',
  'seo.feature1.title': 'Système de suivi de présence étudiant gratuit :',
  'seo.feature1.body': 'Commencez sans débourser un centime. Nous proposons un {emph1}suivi de présence étudiant gratuit{emphEnd} plus puissant que les alternatives payantes.',
  'seo.feature2.title': 'Boucle d’habitude quotidienne :',
  'seo.feature2.body': 'Enregistrez vos cours en moins de 30 secondes. Notre {emph1}présence en ligne pour étudiants{emphEnd} est optimisée pour la vitesse et l’usage quotidien.',
  'seo.feature3.title': 'Calculateur d’absence :',
  'seo.feature3.body': 'La fonctionnalité préférée des étudiants. Voyez votre « budget d’absence » par matière. Plus de calcul à la main sur le dos de votre cahier.',
  'seo.feature4.title': 'Système complet de suivi des présences en ligne :',
  'seo.feature4.body': 'Consultez les journaux détaillés, les pourcentages par matière et les barres de progression globales. C’est un {emph1}système de suivi de présence en ligne gratuit{emphEnd} qui vous informe.',
  'seo.h3.school': 'Le meilleur suivi de présence pour l’école gratuit',
  'seo.p4': 'Contrairement à une {emph1}feuille de suivi de présence{emphEnd} statique, notre application est dynamique. Si un cours est annulé ou si vous avez un jour férié, marquez le jour comme « Libre » et votre pourcentage ne sera pas pénalisé. Cela en fait un {emph2}suivi de présence pour l’école gratuit{emphEnd} et complet. Pour ceux qui étudient à la maison, c’est un solide {emph3}suivi de présence pour l’école à la maison{emphEnd}, qui vous aide à garder la discipline et à suivre vos progrès dans diverses matières et activités.',
  'seo.h3.conclusion': 'Conclusion : commencez dès aujourd’hui votre suivi de présence en ligne',
  'seo.p5': 'Arrêtez de vous soucier des calculs et concentrez-vous sur l’essentiel. Utilisez la {emph1}manière la plus simple de suivre les présences{emphEnd} et gardez un dossier propre. Conçu pour tous — rejoignez les milliers de personnes qui ont fait de {emph2}mon suivi de présence{emphEnd} leur compagnon quotidien.',

  // About page
  'about.h1': 'À propos d’Attendance Tracker',
  'about.p1': 'Nous avons construit Attendance Tracker parce que toutes les autres « calculatrices de présence » sont des widgets sans état. Vous collez deux chiffres, obtenez un pourcentage, et oubliez que le site existe.',
  'about.p2': 'Les vrais étudiants vivent dans un emploi du temps. Lundi 9 h, c’est toujours Calcul. Le plus dur dans le suivi des présences, ce n’est pas le calcul — c’est l’enregistrement quotidien. Alors nous avons créé un outil qui connaît votre planning, réduit la question à un seul toucher, et vous montre la suite.',
  'about.principles.h2': 'Nos principes',
  'about.principle1': '{strong1}Gratuit, pour toujours.{strongEnd} Pas de paywall, pas d’offre Pro, pas de pub.',
  'about.principle2': '{strong1}Privé par défaut.{strongEnd} Vos données vous appartiennent. Exportez et supprimez en un clic.',
  'about.principle3': '{strong1}Rapide et accessible.{strongEnd} Fonctionne en 2G, sur un Android d’entrée de gamme, avec un lecteur d’écran.',
  'about.principle4': '{strong1}Calculs honnêtes.{strongEnd} Nous montrons nos hypothèses (% cible, exceptions) au lieu de les cacher.',

  // Contact page
  'contact.h1': 'Nous contacter',
  'contact.p1': 'Nous serions ravis d’avoir de vos nouvelles — rapports de bugs, idées de fonctionnalités, ou simplement un bonjour. Choisissez le canal qui vous convient.',
  'contact.emailLabel': 'E-mail',
  'contact.emailResponse': 'Nous répondons sous 2 jours ouvrés.',
  'contact.bugLabel': 'Signaler un bug',
  'contact.bugBody': 'Vous avez trouvé quelque chose de cassé ? Incluez une capture d’écran et les étapes pour reproduire. La correction la plus rapide vient d’un repro clair.',
  'contact.featureLabel': 'Demande de fonctionnalité',
  'contact.featureBody': 'Nous lisons chaque demande. Les plus demandées sont construites en premier.',
  'contact.privacyLabel': 'Confidentialité et données',
  'contact.privacyBody': 'Pour la suppression, l’export ou toute question de confidentialité, consultez notre {emph1}politique de confidentialité{emphEnd} ou écrivez-nous.',
  'contact.privacyLink': 'politique de confidentialité',
  'contact.headsUp': '{strong1}À noter :{strongEnd} Attendance Tracker est un petit projet, construit par des étudiants. Nous faisons de notre mieux pour répondre rapidement, mais si votre problème bloque un examen ou une échéance, utilisez d’abord le registre officiel de votre établissement.',

  // Privacy page
  'privacy.h1': 'Politique de confidentialité',
  'privacy.lastUpdated': 'Dernière mise à jour : {date}',
  'privacy.h2.collect': 'Ce que nous collectons',
  'privacy.p1': 'Votre nom, e-mail et les données que vous créez : sessions académiques, matières, créneaux d’emploi du temps, journaux de présence quotidiens et exceptions de jours. C’est tout.',
  'privacy.h2.dontDo': 'Ce que nous ne faisons pas',
  'privacy.bullet1': 'Nous ne vendons pas vos données. Point.',
  'privacy.bullet2': 'Nous n’utilisons pas de traqueurs publicitaires tiers.',
  'privacy.bullet3': 'Nous ne journalisons pas votre IP au-delà de ce qui est nécessaire à la limitation de débit.',
  'privacy.h2.cookies': 'Cookies',
  'privacy.cookiesP': 'Nous utilisons un seul cookie de session interne pour l’authentification, plus une clé `localStorage` pour votre préférence de thème. Aucun cookie tiers.',
  'privacy.h2.rights': 'Vos droits',
  'privacy.rightsP': 'Vous pouvez exporter tout ce que vous avez stocké en JSON ou CSV à tout moment depuis {emph1}Paramètres{emphEnd}. Vous pouvez supprimer votre compte au même endroit ; la suppression est ferme et immédiate.',
  'privacy.rightsLink': 'Paramètres',
  'privacy.h2.contact': 'Contact',
  'privacy.contactP': 'Des questions ? Écrivez à {emph1}hello@attendancetrack75.com{emphEnd}.',

  // Terms page
  'terms.h1': 'Conditions d’utilisation',
  'terms.lastUpdated': 'Dernière mise à jour : {date}',
  'terms.intro': 'Attendance Tracker est un outil gratuit fourni en l’état. En l’utilisant, vous acceptez de saisir vos propres données avec exactitude. Les calculs de pourcentage sont des estimations — le registre officiel de votre université fait foi.',
  'terms.h2.warranty': 'Aucune garantie',
  'terms.warrantyP': 'Nous faisons de notre mieux pour garder les calculs justes, mais nous ne pouvons pas garantir que l’outil est exempt d’erreurs. Croisez toujours les décisions importantes avec les registres de votre établissement.',
  'terms.h2.acceptable': 'Usage acceptable',
  'terms.acceptableP': 'N’abusez pas du service (bots, scraping, déni de service). Nous pouvons limiter le débit ou bloquer le trafic abusif.',
  'terms.h2.changes': 'Modifications',
  'terms.changesP': 'Nous pouvons mettre à jour ces conditions. La date de « Dernière mise à jour » en reflètera les changements.',
};

const de: Dict = {
  'nav.today': 'Heutiger Plan',
  'nav.weekly': 'Wochenplan',
  'nav.subjects': 'Fächer',
  'nav.calculator': 'Rechner',
  'nav.sessions': 'Sitzungen',
  'nav.settings': 'Einstellungen',
  'nav.tracker': 'Tracker',
  'shell.logOut': 'Abmelden',
  'btn.back': 'Zurück',
  'btn.continue': 'Weiter',
  'btn.continueAsGuest': 'Als Gast fortfahren',
  'btn.loginAsGuest': 'Als Gast anmelden',
  'btn.continuing': 'Wird fortgesetzt…',
  'btn.save': 'Speichern',
  'btn.saving': 'Speichern…',
  'btn.saveAndContinue': 'Speichern und weiter',
  'btn.createAccount': 'Konto erstellen',
  'btn.logIn': 'Anmelden',
  'btn.getStarted': 'Loslegen',
  'btn.skipForNow': 'Vorerst überspringen',
  'auth.login.title': 'Willkommen zurück',
  'auth.login.subtitle': 'Melde dich an, um deine Serie fortzusetzen.',
  'auth.signup.title': 'Konto erstellen',
  'auth.signup.subtitle': 'In unter einer Minute loslegen.',
  'landing.headline1': 'Der einfachste Weg,',
  'landing.headline2': 'Anwesenheit zu tracken.',
  'landing.ctaPrimary': 'Meinen Anwesenheits-Tracker starten — Kostenlos',
  'landing.ctaBottomButton': 'Kostenlos tracken',
  'today.title': 'Heute',
  'today.overall': 'Gesamtanwesenheit',

  // FAQ (phase 2)
  'faq.title': 'Warum Studierende unseren kostenlosen Anwesenheits-Tracker lieben',
  'faq.subtitle': 'Alles, was Studierende zum kostenlosen Anwesenheits-Tracker fragen.',
  'faq.q1': 'Ist dieser Anwesenheits-Tracker wirklich kostenlos?',
  'faq.q2': 'Wie erfasse ich meine Anwesenheit als Studierender?',
  'faq.q3': 'Kann ich diesen Anwesenheits-Tracker online auf dem Handy nutzen?',
  'faq.q4': 'Gibt es eine Tracker-App zum Herunterladen?',
  'faq.q5': 'Wie funktioniert der 75%-Anwesenheits-Tracker?',
  'faq.q6': 'Was ist der einfachste Weg, Anwesenheit täglich zu erfassen?',
  'faq.q7': 'Kann ich das als Anwesenheits-Tracker für die Schule nutzen?',
  'faq.q8': 'Gibt es ein kostenloses System ohne Anmeldung?',
  'faq.q9': 'Kann ich mein Anwesenheitsblatt teilen oder exportieren?',
  'faq.q10': 'Funktioniert das als Anwesenheits-Tracker für Mitarbeiter?',
  'faq.q11': 'Wie schneidet ihr im Vergleich zu einer Tabelle ab?',
  // (Long FAQ answers intentionally left as English fallback for German
  //  in phase 2 — native-speaker review recommended.)
  'faq.a1': 'Ja — 100% kostenlos, keine Kreditkarte, keine Testphase, keine versteckten Paywalls. Du kannst unseren kostenlosen Anwesenheits-Tracker so lange nutzen, wie du willst, um deine Kurse zu protokollieren, deinen Wochenplan zu erstellen und deinen aktuellen Prozentsatz zu sehen. Die kostenpflichtige Version ist dieselbe Version; wir schalten keine Funktionen hinter einem Abo frei.',
  'faq.a2': 'Melde dich an, füge deine Fächer und Praktika hinzu, füge deinen Wochenplan ein oder erstelle ihn, und markiere dann jede Stunde als anwesend, abwesend oder frei. Unser Studierenden-Anwesenheits-Tracker übernimmt die Prozentrechnung und sagt dir genau, wie viele Stunden du pro Fach noch versäumen kannst, ohne unter dein Ziel zu fallen.',
  'faq.a3': 'Ja. Unser Online-Anwesenheits-Tracker läuft in jedem modernen Browser, auf jedem Gerät — Handy, Tablet oder Laptop. Nichts herunterzuladen, nichts zu installieren. Einmal anmelden und deine Daten folgen dir.',
  'faq.a4': 'Du brauchst keine. Unsere Web-App ist ein vollwertiger Tracker, den du mit einem Tippen auf dem Startbildschirm deines Handys anheften kannst — also wie eine native App, ohne dass du etwas aus einem Store herunterladen musst. Du bekommst dieselbe Geschwindigkeit, Vollbild-Erlebnis und Offline-Gefühl.',
  'faq.a5': 'Die meisten Hochschulen und viele internationale Universitäten verlangen eine 75%-Anwesenheit. Mit unserer 75%-Zielfunktion kannst du pro Session ein eigenes Ziel (50–100%) festlegen und siehst sofort deinen aktuellen Prozentsatz, wie viele Stunden du besucht hast und wie viele du noch verpassen kannst. Wir unterstützen auch 80%-Ziele — alles zwischen 50 und 100.',
  'faq.a6': 'Öffne die Heute-Seite, sieh die Stunden des Tages und tippe für jedes Fach auf +, − oder Frei. Der ganze Vorgang dauert unter 30 Sekunden. Es ist der einfachste Weg, Anwesenheit zu erfassen, weil du dir später nichts merken musst — Tag, Uhrzeit und Fach sind schon aus deinem Wochenplan eingetragen.',
  'faq.a7': 'Absolut. Auch wenn die App auf den Hochschul-Wochenplan zugeschnitten ist, funktioniert sie genauso gut als kostenloser Schul-Anwesenheits-Tracker. Füge deine Fächer hinzu, lege deinen Plan fest und beginne mit dem Markieren. Es gibt keine Begrenzung für die Anzahl der Fächer oder Sessions.',
  'faq.a8': 'Du kannst die App als Gast ohne Konto testen, aber um deine Daten geräte- und sitzungsübergreifend zu behalten, dauert die Anmeldung per E-Mail nur 10 Sekunden. In beiden Fällen bekommst du das volle kostenlose Studierenden-Anwesenheitssystem — keine Funktion ist hinter einem Konto versteckt.',
  'faq.a9': 'Deine Daten liegen in deinem Konto und du kannst sie jederzeit im Dashboard, in der Wochenansicht oder in der Fachansicht prüfen. Der Export in ein druckbares Anwesenheitsblatt ist auf der Roadmap — bis dahin decken die App-Ansichten jeden Bericht ab, den du auf einen Blick brauchst.',
  'faq.a10': 'Die App ist auf den akademischen Wochenzyklus zugeschnitten (Mo–So-Plan, Praktika, Prozentziele), sie ist also kein Mitarbeiter-Anwesenheits-Tracker im HR/Payroll-Sinn. Für ein persönliches Logbuch deiner freien Tage kannst du sie so nutzen, aber für Stempelzeiten, Urlaub und Gehaltsabrechnung brauchst du ein Workforce-Tool.',
  'faq.a11': 'Eine Tabellenkalkulation funktioniert, bis du Anwesenheitstage zählen, Praktika gewichten oder Ferien beachten musst. Unsere App erledigt Zählen, Prozentrechnung, Praktikumsgewichtung und Feiertagserkennung automatisch — und sie läuft auf deinem Handy, was eine Tabelle meistens nicht tut.',

  // Marketing long-form (phase 2) — German
  'seo.h2': 'Der ultimative Online-Anwesenheits-Tracker für Studierende',
  'seo.h3.app': 'Warum eine Studierenden-Anwesenheits-Tracker-App nutzen?',
  'seo.h3.free': '100% kostenlose Studierenden-Anwesenheit',
  'seo.h3.features': 'Funktionen unserer Online-Anwesenheit für Studierende',
  'seo.h3.school': 'Der beste kostenlose Schul-Anwesenheits-Tracker',
  'seo.h3.conclusion': 'Fazit: Starte noch heute mit deinem Online-Anwesenheits-Tracker',
  // Long body paragraphs intentionally left to fall back to English in
  // German — too much marketing copy to translate accurately in phase 2.
  // (TODO: de-translate all `seo.p*` keys when a native German speaker reviews.)

  // About page (German)
  'about.h1': 'Über Attendance Tracker',
  'about.principles.h2': 'Unsere Prinzipien',
  'about.principle1': '{strong1}Kostenlos, für immer.{strongEnd} Keine Paywall, kein Pro-Tarif, keine Werbung.',
  'about.principle2': '{strong1}Privat by Default.{strongEnd} Deine Daten gehören dir. Export und Löschen mit einem Klick.',
  'about.principle3': '{strong1}Schnell und barrierefrei.{strongEnd} Funktioniert mit 2G, auf günstigen Android-Geräten, mit Screenreadern.',
  'about.principle4': '{strong1}Ehrliche Mathematik.{strongEnd} Wir zeigen unsere Annahmen (Ziel-%, Tag-Ausnahmen) statt sie zu verstecken.',

  // Contact (German)
  'contact.h1': 'Kontakt',
  'contact.emailLabel': 'E-Mail',
  'contact.emailResponse': 'Wir antworten innerhalb von 2 Werktagen.',
  'contact.bugLabel': 'Fehler melden',
  'contact.featureLabel': 'Feature-Wunsch',
  'contact.privacyLabel': 'Datenschutz & Daten',
  'contact.privacyLink': 'Datenschutzerklärung',
  'contact.headsUp': '{strong1}Hinweis:{strongEnd} Attendance Tracker ist ein kleines, von Studierenden gebautes Projekt. Wir antworten so schnell wie möglich, aber wenn dein Problem eine Prüfung oder Frist blockiert, nutze zuerst das offizielle Register deiner Einrichtung.',

  // Privacy (German headlines only)
  'privacy.h1': 'Datenschutzerklärung',
  'privacy.h2.collect': 'Was wir erheben',
  'privacy.h2.dontDo': 'Was wir nicht tun',
  'privacy.h2.cookies': 'Cookies',
  'privacy.h2.rights': 'Deine Rechte',
  'privacy.h2.contact': 'Kontakt',
  'privacy.rightsLink': 'Einstellungen',
  'privacy.bullet1': 'Wir verkaufen deine Daten nicht. Punkt.',
  'privacy.bullet2': 'Wir nutzen keine Werbe-Tracker von Drittanbietern.',
  'privacy.bullet3': 'Wir protokollieren deine IP nicht über das hinaus, was für das Rate-Limiting nötig ist.',

  // Terms (German headlines only)
  'terms.h1': 'Nutzungsbedingungen',
  'terms.h2.warranty': 'Keine Garantie',
  'terms.h2.acceptable': 'Akzeptable Nutzung',
  'terms.h2.changes': 'Änderungen',
  'terms.acceptableP': 'Missbrauche den Dienst nicht (Bots, Scraping, Denial-of-Service). Wir können den Verkehr drosseln oder blockieren.',
  'terms.changesP': 'Wir können diese Bedingungen aktualisieren. Das Datum „Zuletzt aktualisiert" spiegelt die Änderungen.',
};

const pt: Dict = {
  'nav.today': 'Agenda de hoje',
  'nav.weekly': 'Agenda semanal',
  'nav.subjects': 'Disciplinas',
  'nav.calculator': 'Calculadora',
  'nav.sessions': 'Períodos',
  'nav.settings': 'Configurações',
  'nav.tracker': 'Tracker',
  'shell.logOut': 'Sair',
  'btn.back': 'Voltar',
  'btn.continue': 'Continuar',
  'btn.continueAsGuest': 'Continuar como visitante',
  'btn.loginAsGuest': 'Entrar como visitante',
  'btn.continuing': 'Continuando…',
  'btn.save': 'Salvar',
  'btn.saving': 'Salvando…',
  'btn.saveAndContinue': 'Salvar e continuar',
  'btn.createAccount': 'Criar conta',
  'btn.logIn': 'Entrar',
  'btn.getStarted': 'Começar',
  'btn.skipForNow': 'Pular por agora',
  'auth.login.title': 'Bem-vindo de volta',
  'auth.login.subtitle': 'Entre para manter sua sequência.',
  'auth.signup.title': 'Crie sua conta',
  'auth.signup.subtitle': 'Comece a registrar em menos de um minuto.',
  'landing.headline1': 'A forma mais fácil de',
  'landing.headline2': 'registrar presença.',
  'landing.ctaPrimary': 'Começar meu registro — Grátis',
  'landing.ctaBottomButton': 'Comece a registrar grátis',
  'today.title': 'Hoje',
  'today.overall': 'Presença geral',

  // FAQ (phase 2)
  'faq.title': 'Por que os estudantes adoram nosso registro de presença gratuito',
  'faq.subtitle': 'Tudo o que os estudantes perguntam sobre o registro de presença gratuito.',
  'faq.q1': 'Este registro de presença é realmente gratuito?',
  'faq.q2': 'Como registro minha presença como estudante?',
  'faq.q3': 'Posso usar este registro de presença online pelo celular?',
  'faq.q4': 'Existe um app de registro de presença para baixar?',
  'faq.q5': 'Como funciona o registro do critério de 75% de presença?',
  'faq.q6': 'Qual é a forma mais fácil de registrar presença todo dia?',
  'faq.q7': 'Posso usar isto como registro de presença para a escola?',
  'faq.q8': 'Existe um sistema gratuito de registro de presença para estudantes sem cadastro?',
  'faq.q9': 'Posso compartilhar ou exportar minha planilha de presença?',
  'faq.q10': 'Funciona como registro de presença para funcionários?',
  'faq.q11': 'Como vocês se comparam a uma planilha?',
  'faq.a1': 'Sim — 100% gratuito, sem cartão de crédito, sem teste, sem paywalls ocultos. Você pode usar nosso registro de presença gratuito para registrar suas aulas, montar sua agenda semanal e ver sua porcentagem atual pelo tempo que quiser. A versão paga é a mesma versão; não bloqueamos recursos atrás de uma assinatura.',
  'faq.a2': 'Cadastre-se, adicione as disciplinas e laboratórios que você cursa, cole ou monte sua agenda semanal e marque cada aula como presente, ausente ou livre. Nosso registro de presença para estudantes faz o cálculo da porcentagem e te diz exatamente quantas aulas a mais você pode faltar por disciplina sem cair abaixo da sua meta.',
  'faq.a3': 'Sim. Nosso registro de presença online para estudantes funciona em qualquer navegador moderno, em qualquer dispositivo — celular, tablet ou notebook. Nada para baixar, nada para instalar. Entre uma vez e seus dados te acompanham.',
  'faq.a4': 'Você não precisa de um. Nosso web app é um app completo de registro de presença que você pode fixar na tela inicial do celular com um toque, funcionando como um app nativo sem precisar baixar de uma loja. Você tem a mesma velocidade, experiência em tela cheia e sensação offline.',
  'faq.a5': 'A maioria das universidades e muitos centros internacionais exigem a regra de 75% de presença. Nossa função de critério de 75% permite definir uma meta personalizada por sessão (50–100%) e mostra na hora sua porcentagem atual, quantas aulas você compareceu e quantas ainda pode faltar. Também aceitamos metas de 80% — qualquer valor entre 50 e 100.',
  'faq.a6': 'Abra a página Hoje, veja as aulas do dia e toque em +, − ou Livre para cada disciplina. O processo todo leva menos de 30 segundos. É a forma mais fácil de registrar presença porque você não precisa lembrar de nada depois — o dia, a hora e a disciplina já vêm preenchidos da sua agenda semanal.',
  'faq.a7': 'Com certeza. Embora o app seja feito em torno da agenda semanal universitária, ele também funciona como registro de presença para a escola gratuito. Adicione suas disciplinas, configure a agenda e comece a marcar. Não há limite para o número de disciplinas ou sessões.',
  'faq.a8': 'Você pode experimentar o app como visitante sem criar conta, mas para manter seus dados entre dispositivos e sessões, cadastrar-se com um e-mail leva 10 segundos. De qualquer forma, você ganha o sistema completo gratuito de registro de presença para estudantes — nenhum recurso fica bloqueado por uma conta.',
  'faq.a9': 'Seus dados ficam na sua conta e você pode consultá-los a qualquer momento no painel, na visão semanal ou na visão por disciplina. A exportação para uma planilha de presença imprimível está no roadmap — por enquanto, as visões do app cobrem todos os relatórios que você precisa ver em um relance.',
  'faq.a10': 'O app foi feito para o ciclo semanal acadêmico (seg–dom, laboratórios, metas em porcentagem), então não é um registro de presença para funcionários no sentido de RH/folha. Se você quer um registro pessoal dos seus dias de folga, dá para usar assim, mas para ponto, PTO e folha, você vai querer uma ferramenta de workforce dedicada.',
  'faq.a11': 'Uma planilha de registro de presença para estudantes funciona até você precisar contar dias presentes, ponderar laboratórios ou lembrar feriados. Nosso app faz a contagem, a porcentagem, a ponderação de laboratórios e a detecção de feriados automaticamente — e funciona no seu celular, o que uma planilha normalmente não faz.',

  // Marketing long-form (phase 2) — Portuguese (headlines only)
  'seo.h2': 'O melhor registro de presença online para estudantes',
  'seo.h3.app': 'Por que usar um app de registro de presença para estudantes?',
  'seo.h3.free': '100% de presença gratuita para estudantes',
  'seo.h3.features': 'Recursos da nossa presença online para estudantes',
  'seo.h3.school': 'O melhor registro de presença para a escola gratuito',
  'seo.h3.conclusion': 'Conclusão: comece a usar seu registro de presença online hoje',

  // About (Portuguese)
  'about.h1': 'Sobre o Attendance Tracker',
  'about.principles.h2': 'Nossos princípios',
  'about.principle1': '{strong1}Gratuito, para sempre.{strongEnd} Sem paywall, sem plano Pro, sem anúncios.',
  'about.principle2': '{strong1}Privado por padrão.{strongEnd} Seus dados são seus. Exporte e apague com um clique.',
  'about.principle3': '{strong1}Rápido e acessível.{strongEnd} Funciona em 2G, em um Android básico, com leitor de tela.',
  'about.principle4': '{strong1}Matemática honesta.{strongEnd} Mostramos nossas premissas (meta %, exceções) em vez de escondê-las.',

  // Contact (Portuguese)
  'contact.h1': 'Fale conosco',
  'contact.emailLabel': 'E-mail',
  'contact.emailResponse': 'Respondemos em até 2 dias úteis.',
  'contact.bugLabel': 'Reportar um bug',
  'contact.featureLabel': 'Pedir recurso',
  'contact.privacyLabel': 'Privacidade e dados',
  'contact.privacyLink': 'Política de privacidade',
  'contact.headsUp': '{strong1}Atenção:{strongEnd} o Attendance Tracker é um projeto pequeno, feito por estudantes. Fazemos o possível para responder rápido, mas se o seu problema está bloqueando uma prova ou prazo, recorra primeiro ao registro oficial da sua instituição.',

  // Privacy (Portuguese headlines)
  'privacy.h1': 'Política de privacidade',
  'privacy.h2.collect': 'O que coletamos',
  'privacy.h2.dontDo': 'O que não fazemos',
  'privacy.h2.cookies': 'Cookies',
  'privacy.h2.rights': 'Seus direitos',
  'privacy.h2.contact': 'Contato',
  'privacy.rightsLink': 'Configurações',
  'privacy.bullet1': 'Não vendemos seus dados. Ponto.',
  'privacy.bullet2': 'Não usamos rastreadores de anúncios de terceiros.',
  'privacy.bullet3': 'Não registramos seu IP além do necessário para limitar a taxa.',

  // Terms (Portuguese headlines)
  'terms.h1': 'Termos de serviço',
  'terms.h2.warranty': 'Sem garantia',
  'terms.h2.acceptable': 'Uso aceitável',
  'terms.h2.changes': 'Alterações',
  'terms.acceptableP': 'Não abuse do serviço (bots, scraping, negação de serviço). Podemos limitar a taxa ou bloquear tráfego abusivo.',
  'terms.changesP': 'Podemos atualizar estes termos. A data de "Última atualização" refletirá as mudanças.',
};

const ar: Dict = {
  'nav.today': 'جدول اليوم',
  'nav.weekly': 'الجدول الأسبوعي',
  'nav.subjects': 'المواد',
  'nav.calculator': 'الحاسبة',
  'nav.sessions': 'الفصول',
  'nav.settings': 'الإعدادات',
  'nav.tracker': 'المتعقب',
  'shell.logOut': 'تسجيل الخروج',
  'btn.back': 'رجوع',
  'btn.continue': 'متابعة',
  'btn.continueAsGuest': 'متابعة كضيف',
  'btn.loginAsGuest': 'تسجيل الدخول كضيف',
  'btn.continuing': 'جارٍ المتابعة…',
  'btn.save': 'حفظ',
  'btn.saving': 'جارٍ الحفظ…',
  'btn.saveAndContinue': 'حفظ ومتابعة',
  'btn.createAccount': 'إنشاء حساب',
  'btn.logIn': 'تسجيل الدخول',
  'btn.getStarted': 'ابدأ',
  'btn.skipForNow': 'تخطٍّ الآن',
  'auth.login.title': 'مرحبًا بعودتك',
  'auth.login.subtitle': 'سجّل الدخول للحفاظ على سلاستك.',
  'auth.signup.title': 'أنشئ حسابك',
  'auth.signup.subtitle': 'ابدأ التتبع في أقل من دقيقة.',
  'landing.headline1': 'أسهل طريقة لـ',
  'landing.headline2': 'تتبّع الحضور.',
  'landing.ctaPrimary': 'ابدأ متعقب الحضور — مجانًا',
  'landing.ctaBottomButton': 'ابدأ التتبع مجانًا',
  'today.title': 'اليوم',
  'today.overall': 'الحضور الإجمالي',

  // FAQ (phase 2) — Arabic
  'faq.title': 'لماذا يحب الطلاب متتبع الحضور المجاني',
  'faq.subtitle': 'كل ما يسأل عنه الطلاب حول متتبع الحضور المجاني.',
  'faq.q1': 'هل متتبع الحضور هذا مجاني فعلاً؟',
  'faq.q2': 'كيف أتتبع حضوري كطالب؟',
  'faq.q3': 'هل يمكنني استخدام متتبع الحضور عبر الإنترنت من هاتفي؟',
  'faq.q4': 'هل يوجد تطبيق متتبع حضور يمكنني تنزيله؟',
  'faq.q5': 'كيف يعمل متتبع شرط الحضور 75%؟',
  'faq.q6': 'ما أسهل طريقة لتتبع الحضور يوميًا؟',
  'faq.q7': 'هل يمكنني استخدامه متتبع حضور للمدرسة؟',
  'faq.q8': 'هل يوجد نظام متتبع حضور طلابي مجاني بدون تسجيل؟',
  'faq.q9': 'هل يمكنني مشاركة ورقة الحضور أو تصديرها؟',
  'faq.q10': 'هل يعمل كمتتبع حضور للموظفين؟',
  'faq.q11': 'كيف تقارنون بجدول بيانات أو ورقة تتبع حضور؟',
  // (Long FAQ answers left to fall back to English in Arabic for phase 2.)

  // Marketing long-form (Arabic headlines only)
  'seo.h2': 'أفضل متتبع حضور عبر الإنترنت للطلاب',
  'seo.h3.app': 'لماذا تستخدم تطبيق متتبع حضور للطلاب؟',
  'seo.h3.free': 'حضور طلابي مجاني 100%',
  'seo.h3.features': 'مميزات متتبع الحضور عبر الإنترنت للطلاب',
  'seo.h3.school': 'أفضل متتبع حضور للمدرسة مجانًا',
  'seo.h3.conclusion': 'الخلاصة: ابدأ باستخدام متتبع الحضور عبر الإنترنت اليوم',

  // About (Arabic)
  'about.h1': 'حول متعقب الحضور',
  'about.principles.h2': 'مبادئنا',
  'about.principle1': '{strong1}مجاني، للأبد.{strongEnd} لا جدران دفع، لا خطة Pro، لا إعلانات.',
  'about.principle2': '{strong1}خاص افتراضيًا.{strongEnd} بياناتك ملكك. تصدير وحذف بنقرة واحدة.',
  'about.principle3': '{strong1}سريع ومتاح للجميع.{strongEnd} يعمل على شبكة 2G، وعلى هاتف أندرويد منخفض المواصفات، مع قارئ شاشة.',
  'about.principle4': '{strong1}رياضيات صادقة.{strongEnd} نُظهر افتراضاتنا (النسبة المستهدفة، استثناءات اليوم) بدل إخفائها.',

  // Contact (Arabic)
  'contact.h1': 'اتصل بنا',
  'contact.emailLabel': 'البريد الإلكتروني',
  'contact.emailResponse': 'نرد خلال يومي عمل.',
  'contact.bugLabel': 'الإبلاغ عن خطأ',
  'contact.featureLabel': 'طلب ميزة',
  'contact.privacyLabel': 'الخصوصية والبيانات',
  'contact.privacyLink': 'سياسة الخصوصية',
  'contact.headsUp': '{strong1}تنبيه:{strongEnd} متعقب الحضور مشروع صغير بناه طلاب. نبذل قصارى جهدنا للرد بسرعة، لكن إذا كانت مشكلتك تعيق امتحانًا أو موعدًا نهائيًا، فاعتمد أولًا على السجل الرسمي لمؤسستك.',

  // Privacy (Arabic headlines)
  'privacy.h1': 'سياسة الخصوصية',
  'privacy.h2.collect': 'ما الذي نجمعه',
  'privacy.h2.dontDo': 'ما لا نفعله',
  'privacy.h2.cookies': 'ملفات تعريف الارتباط',
  'privacy.h2.rights': 'حقوقك',
  'privacy.h2.contact': 'تواصل',
  'privacy.rightsLink': 'الإعدادات',
  'privacy.bullet1': 'لا نبيع بياناتك. انتهى.',
  'privacy.bullet2': 'لا نستخدم متعقبات إعلانية لطرف ثالث.',
  'privacy.bullet3': 'لا نسجل عنوان IP الخاص بك أكثر مما يلزم لتحديد المعدل.',

  // Terms (Arabic headlines)
  'terms.h1': 'شروط الخدمة',
  'terms.h2.warranty': 'بدون ضمان',
  'terms.h2.acceptable': 'الاستخدام المقبول',
  'terms.h2.changes': 'التغييرات',
  'terms.acceptableP': 'لا تسيء استخدام الخدمة (روبوتات، كشط، حجب الخدمة). قد نحدد المعدل أو نحجب الحركة المسيئة.',
  'terms.changesP': 'قد نُحدّث هذه الشروط. سيُعكس تاريخ "آخر تحديث" التغييرات.',
};

const zh: Dict = {
  'nav.today': '今日课表',
  'nav.weekly': '每周课表',
  'nav.subjects': '科目',
  'nav.calculator': '计算器',
  'nav.sessions': '学期',
  'nav.settings': '设置',
  'nav.tracker': '追踪',
  'shell.logOut': '退出登录',
  'btn.back': '返回',
  'btn.continue': '继续',
  'btn.continueAsGuest': '以访客身份继续',
  'btn.loginAsGuest': '以访客身份登录',
  'btn.continuing': '继续中…',
  'btn.save': '保存',
  'btn.saving': '保存中…',
  'btn.saveAndContinue': '保存并继续',
  'btn.createAccount': '创建账户',
  'btn.logIn': '登录',
  'btn.getStarted': '开始',
  'btn.skipForNow': '暂时跳过',
  'auth.login.title': '欢迎回来',
  'auth.login.subtitle': '登录以保持你的连续记录。',
  'auth.signup.title': '创建你的账户',
  'auth.signup.subtitle': '不到一分钟即可开始记录。',
  'landing.headline1': '最简单的',
  'landing.headline2': '考勤追踪方式。',
  'landing.ctaPrimary': '开始我的考勤追踪 — 免费',
  'landing.ctaBottomButton': '免费开始追踪',
  'today.title': '今天',
  'today.overall': '总出勤率',

  // FAQ (phase 2) — Chinese
  'faq.title': '为什么学生喜爱我们的免费考勤追踪器',
  'faq.subtitle': '学生关于免费考勤追踪器的所有常见问题。',
  'faq.q1': '这个考勤追踪器真的免费吗？',
  'faq.q2': '作为学生，我该如何记录出勤？',
  'faq.q3': '我可以在手机上在线使用这个考勤追踪器吗？',
  'faq.q4': '有可以下载的考勤追踪器应用吗？',
  'faq.q5': '75% 出勤要求追踪器是如何工作的？',
  'faq.q6': '每天记录出勤最简单的方法是什么？',
  'faq.q7': '我能把它当作学校考勤追踪器使用吗？',
  'faq.q8': '有没有不需要注册的免费学生出勤系统？',
  'faq.q9': '我可以分享或导出我的出勤表吗？',
  'faq.q10': '它能作为员工出勤追踪器使用吗？',
  'faq.q11': '相比电子表格，你们有什么优势？',
  // (Long FAQ answers left to fall back to English in Chinese for phase 2.)

  // Marketing long-form (Chinese headlines only)
  'seo.h2': '最适合学生的在线考勤追踪器',
  'seo.h3.app': '为什么要使用学生考勤追踪器应用？',
  'seo.h3.free': '100% 免费的学生出勤',
  'seo.h3.features': '我们的在线学生出勤功能',
  'seo.h3.school': '最好的免费学校考勤追踪器',
  'seo.h3.conclusion': '结论：今天就开始使用你的在线考勤追踪器',

  // About (Chinese)
  'about.h1': '关于考勤追踪器',
  'about.principles.h2': '我们的原则',
  'about.principle1': '{strong1}永久免费。{strongEnd}无付费墙、无 Pro 套餐、无广告。',
  'about.principle2': '{strong1}默认私密。{strongEnd}你的数据属于你。一键导出和删除。',
  'about.principle3': '{strong1}快速且可访问。{strongEnd}在 2G 网络、低端安卓设备、屏幕阅读器上都能用。',
  'about.principle4': '{strong1}诚实的算法。{strongEnd}我们公开假设（目标百分比、日期例外）而不是隐藏它们。',

  // Contact (Chinese)
  'contact.h1': '联系我们',
  'contact.emailLabel': '邮箱',
  'contact.emailResponse': '我们会在 2 个工作日内回复。',
  'contact.bugLabel': '报告 Bug',
  'contact.featureLabel': '功能请求',
  'contact.privacyLabel': '隐私与数据',
  'contact.privacyLink': '隐私政策',
  'contact.headsUp': '{strong1}提示：{strongEnd}考勤追踪器是一个由学生开发的小项目。我们会尽力快速回复，但如果你的问题影响到了考试或截止日期，请先以你所在学校的官方记录为准。',

  // Privacy (Chinese headlines)
  'privacy.h1': '隐私政策',
  'privacy.h2.collect': '我们收集什么',
  'privacy.h2.dontDo': '我们不做什么',
  'privacy.h2.cookies': 'Cookie',
  'privacy.h2.rights': '你的权利',
  'privacy.h2.contact': '联系',
  'privacy.rightsLink': '设置',
  'privacy.bullet1': '我们不出售你的数据。完。',
  'privacy.bullet2': '我们不运行第三方广告追踪器。',
  'privacy.bullet3': '我们不会超出限流所需记录你的 IP。',

  // Terms (Chinese headlines)
  'terms.h1': '服务条款',
  'terms.h2.warranty': '无担保',
  'terms.h2.acceptable': '可接受的使用',
  'terms.h2.changes': '变更',
  'terms.acceptableP': '请勿滥用服务（机器人、爬虫、拒绝服务）。我们可能会限流或屏蔽滥用流量。',
  'terms.changesP': '我们可能会更新这些条款。"最后更新"日期将反映这些变更。',
};

const ja: Dict = {
  'nav.today': '今日の時間割',
  'nav.weekly': '週間時間割',
  'nav.subjects': '科目',
  'nav.calculator': '計算ツール',
  'nav.sessions': '学期',
  'nav.settings': '設定',
  'nav.tracker': 'トラッカー',
  'shell.logOut': 'ログアウト',
  'btn.back': '戻る',
  'btn.continue': '続ける',
  'btn.continueAsGuest': 'ゲストとして続ける',
  'btn.loginAsGuest': 'ゲストとしてログイン',
  'btn.continuing': '続行中…',
  'btn.save': '保存',
  'btn.saving': '保存中…',
  'btn.saveAndContinue': '保存して続行',
  'btn.createAccount': 'アカウントを作成',
  'btn.logIn': 'ログイン',
  'btn.getStarted': 'はじめる',
  'btn.skipForNow': '今はスキップ',
  'auth.login.title': 'おかえりなさい',
  'auth.login.subtitle': '連続記録を続けるにはログインしてください。',
  'auth.signup.title': 'アカウントを作成',
  'auth.signup.subtitle': '1分以内に記録を始めましょう。',
  'landing.headline1': '一番かんたんな',
  'landing.headline2': '出席管理の方法。',
  'landing.ctaPrimary': '出席トラッカーを始める — 無料',
  'landing.ctaBottomButton': '無料で記録を始める',
  'today.title': '今日',
  'today.overall': '全体の出席',

  // FAQ (phase 2) — Japanese
  'faq.title': '学生が無料出席トラッカーを気に入る理由',
  'faq.subtitle': '無料出席トラッカーについて学生からよくある質問。',
  'faq.q1': 'この出席トラッカーは本当に無料ですか？',
  'faq.q2': '学生として出席を記録するには？',
  'faq.q3': 'スマートフォンからオンラインでこの出席トラッカーは使えますか？',
  'faq.q4': 'ダウンロードできる出席トラッカーアプリはありますか？',
  'faq.q5': '75%出席基準トラッカーはどのように機能しますか？',
  'faq.q6': '毎日出席を記録する一番簡単な方法は？',
  'faq.q7': '学校の出席トラッカーとして使えますか？',
  'faq.q8': '登録不要の無料学生出席トラッキングシステムはありますか？',
  'faq.q9': '出席表を共有したりエクスポートできますか？',
  'faq.q10': '従業員出席トラッカーとして機能しますか？',
  'faq.q11': 'スプレッドシートや出席追跡シートとどう違いますか？',
  // (Long FAQ answers left to fall back to English in Japanese for phase 2.)

  // Marketing long-form (Japanese headlines only)
  'seo.h2': '学生のための究極のオンライン出席トラッカー',
  'seo.h3.app': '学生出席トラッカーアプリを使う理由は？',
  'seo.h3.free': '100% 無料の学生出席',
  'seo.h3.features': 'オンライン学生出席の特長',
  'seo.h3.school': '学校向けの最高無料出席トラッカー',
  'seo.h3.conclusion': 'まとめ：今日からオンライン出席トラッカーを使おう',

  // About (Japanese)
  'about.h1': '出席トラッカーについて',
  'about.principles.h2': '私たちの原則',
  'about.principle1': '{strong1}ずっと無料。{strongEnd}有料壁、Pro プラン、広告はなし。',
  'about.principle2': '{strong1}既定でプライベート。{strongEnd}データはあなたのもの。ワンクリックでエクスポート・削除。',
  'about.principle3': '{strong1}高速でアクセシブル。{strongEnd}2G回線、低スペックAndroid、スクリーンリーダーでも動作。',
  'about.principle4': '{strong1}正直な計算。{strongEnd}前提（目標%、休日の例外）を隠さずにお見せします。',

  // Contact (Japanese)
  'contact.h1': 'お問い合わせ',
  'contact.emailLabel': 'メール',
  'contact.emailResponse': '2営業日以内にご返信します。',
  'contact.bugLabel': 'バグ報告',
  'contact.featureLabel': '機能リクエスト',
  'contact.privacyLabel': 'プライバシーとデータ',
  'contact.privacyLink': 'プライバシーポリシー',
  'contact.headsUp': '{strong1}ご注意：{strongEnd}出席トラッカーは学生による小さなプロジェクトです。迅速な返信を心がけますが、試験や締切を妨げる問題については、まず所属機関の公式記録に従ってください。',

  // Privacy (Japanese headlines)
  'privacy.h1': 'プライバシーポリシー',
  'privacy.h2.collect': '収集する情報',
  'privacy.h2.dontDo': 'しないこと',
  'privacy.h2.cookies': 'Cookie',
  'privacy.h2.rights': 'あなたの権利',
  'privacy.h2.contact': 'お問い合わせ',
  'privacy.rightsLink': '設定',
  'privacy.bullet1': 'あなたのデータを販売しません。以上。',
  'privacy.bullet2': '第三者広告トラッカーを使用しません。',
  'privacy.bullet3': 'レート制限に必要な範囲を超えて IP を記録しません。',

  // Terms (Japanese headlines)
  'terms.h1': '利用規約',
  'terms.h2.warranty': '無保証',
  'terms.h2.acceptable': '許容される利用',
  'terms.h2.changes': '変更',
  'terms.acceptableP': 'サービスを悪用しないでください（ボット、スクレイピング、DoS）。悪質なトラフィックを制限またはブロックする場合があります。',
  'terms.changesP': '本規約を更新する場合があります。「最終更新日」が変更を反映します。',
};

const ru: Dict = {
  'nav.today': 'Расписание на сегодня',
  'nav.weekly': 'Недельное расписание',
  'nav.subjects': 'Предметы',
  'nav.calculator': 'Калькулятор',
  'nav.sessions': 'Сессии',
  'nav.settings': 'Настройки',
  'nav.tracker': 'Трекер',
  'shell.logOut': 'Выйти',
  'btn.back': 'Назад',
  'btn.continue': 'Продолжить',
  'btn.continueAsGuest': 'Продолжить как гость',
  'btn.loginAsGuest': 'Войти как гость',
  'btn.continuing': 'Продолжение…',
  'btn.save': 'Сохранить',
  'btn.saving': 'Сохранение…',
  'btn.saveAndContinue': 'Сохранить и продолжить',
  'btn.createAccount': 'Создать аккаунт',
  'btn.logIn': 'Войти',
  'btn.getStarted': 'Начать',
  'btn.skipForNow': 'Пропустить',
  'auth.login.title': 'С возвращением',
  'auth.login.subtitle': 'Войдите, чтобы сохранить серию.',
  'auth.signup.title': 'Создайте аккаунт',
  'auth.signup.subtitle': 'Начните учёт меньше чем за минуту.',
  'landing.headline1': 'Самый простой способ',
  'landing.headline2': 'вести посещаемость.',
  'landing.ctaPrimary': 'Начать мой трекер — Бесплатно',
  'landing.ctaBottomButton': 'Начать бесплатно',
  'today.title': 'Сегодня',
  'today.overall': 'Общая посещаемость',

  // FAQ (phase 2) — Russian
  'faq.title': 'Почему студенты любят наш бесплатный трекер посещаемости',
  'faq.subtitle': 'Что студенты спрашивают о бесплатном трекере посещаемости.',
  'faq.q1': 'Этот трекер посещаемости действительно бесплатный?',
  'faq.q2': 'Как мне отслеживать посещаемость как студенту?',
  'faq.q3': 'Можно ли пользоваться трекером онлайн с телефона?',
  'faq.q4': 'Есть ли приложение-трекер, которое можно скачать?',
  'faq.q5': 'Как работает трекер критерия 75% посещаемости?',
  'faq.q6': 'Какой самый простой способ отслеживать посещаемость каждый день?',
  'faq.q7': 'Можно ли использовать его как трекер посещаемости для школы?',
  'faq.q8': 'Есть ли бесплатная система без регистрации?',
  'faq.q9': 'Можно ли поделиться или экспортировать лист посещаемости?',
  'faq.q10': 'Подойдёт ли это как трекер посещаемости для сотрудников?',
  'faq.q11': 'Чем вы отличаетесь от электронной таблицы?',
  // (Long FAQ answers left to fall back to English in Russian for phase 2.)

  // Marketing long-form (Russian headlines only)
  'seo.h2': 'Лучший онлайн-трекер посещаемости для студентов',
  'seo.h3.app': 'Зачем использовать приложение-трекер посещаемости для студентов?',
  'seo.h3.free': '100% бесплатная посещаемость для студентов',
  'seo.h3.features': 'Возможности нашей онлайн-посещаемости для студентов',
  'seo.h3.school': 'Лучший бесплатный трекер посещаемости для школы',
  'seo.h3.conclusion': 'Итог: начните пользоваться онлайн-трекером сегодня',

  // About (Russian)
  'about.h1': 'О трекере посещаемости',
  'about.principles.h2': 'Наши принципы',
  'about.principle1': '{strong1}Бесплатно навсегда.{strongEnd} Без платных стен, без Pro-тарифа, без рекламы.',
  'about.principle2': '{strong1}Приватно по умолчанию.{strongEnd} Ваши данные — ваши. Экспорт и удаление в один клик.',
  'about.principle3': '{strong1}Быстро и доступно.{strongEnd} Работает в 2G, на слабом Android, со скринридером.',
  'about.principle4': '{strong1}Честная математика.{strongEnd} Мы показываем наши допущения (целевой %, исключения дней), а не прячем их.',

  // Contact (Russian)
  'contact.h1': 'Связаться с нами',
  'contact.emailLabel': 'Эл. почта',
  'contact.emailResponse': 'Отвечаем в течение 2 рабочих дней.',
  'contact.bugLabel': 'Сообщить об ошибке',
  'contact.featureLabel': 'Запрос функции',
  'contact.privacyLabel': 'Приватность и данные',
  'contact.privacyLink': 'Политика конфиденциальности',
  'contact.headsUp': '{strong1}Внимание:{strongEnd} Attendance Tracker — небольшой проект, созданный студентами. Мы стараемся отвечать быстро, но если ваша проблема блокирует экзамен или дедлайн, сначала сверьтесь с официальной записью вашего учебного заведения.',

  // Privacy (Russian headlines)
  'privacy.h1': 'Политика конфиденциальности',
  'privacy.h2.collect': 'Что мы собираем',
  'privacy.h2.dontDo': 'Чего мы не делаем',
  'privacy.h2.cookies': 'Cookies',
  'privacy.h2.rights': 'Ваши права',
  'privacy.h2.contact': 'Контакты',
  'privacy.rightsLink': 'Настройки',
  'privacy.bullet1': 'Мы не продаём ваши данные. Точка.',
  'privacy.bullet2': 'Мы не используем сторонние рекламные трекеры.',
  'privacy.bullet3': 'Мы не логируем ваш IP больше, чем нужно для ограничения частоты запросов.',

  // Terms (Russian headlines)
  'terms.h1': 'Условия использования',
  'terms.h2.warranty': 'Без гарантий',
  'terms.h2.acceptable': 'Допустимое использование',
  'terms.h2.changes': 'Изменения',
  'terms.acceptableP': 'Не злоупотребляйте сервисом (боты, скрапинг, DoS). Мы можем ограничивать частоту или блокировать недобросовестный трафик.',
  'terms.changesP': 'Мы можем обновлять эти условия. Дата «Последнего обновления» отразит изменения.',
};

export const translations: Record<Locale, Dict> = {
  en, hi, es, fr, de, pt, ar, zh, ja, ru,
};

/** Look up a key with English fallback. Returns the raw key if missing. */
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

/** Format a translated string with placeholders. `{name}` → value. */
export function fmt(locale: Locale, key: string, params: Record<string, string | number> = {}): string {
  let s = t(locale, key);
  for (const [k, v] of Object.entries(params)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return s;
}

/**
 * Parse a translated string with `{emphN}...{emphEnd}` markers into
 * segments. The runtime uses this to render paragraphs that contain
 * inline emphasis without losing the bold markup when the user
 * switches locales.
 *
 *   tSegments('en', 'seo.p1')
 *     => [
 *       { text: 'Finding the ', bold: false },
 *       { text: 'easiest way to track attendance', bold: true },
 *       { text: " shouldn't be a chore...", bold: false },
 *       ...
 *     ]
 */
export type Segment = { text: string; bold: boolean; strong?: boolean };
export function tSegments(locale: Locale, key: string): Segment[] {
  const raw = t(locale, key);
  const segments: Segment[] = [];
  // Match {emph1}...{emphEnd} or {strong1}...{strongEnd}.
  const re = /\{(emph|strong)\d+\}([\s\S]*?)\{\1End\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: raw.slice(lastIndex, match.index), bold: false });
    }
    segments.push({
      text: match[2],
      bold: true,
      strong: match[1] === 'strong',
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < raw.length) {
    segments.push({ text: raw.slice(lastIndex), bold: false });
  }
  return segments;
}

/** Resolve a stored value to a known locale, falling back to default. */
export function resolveLocale(stored: string | null | undefined): Locale {
  if (stored && (LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale;
  }
  return DEFAULT_LOCALE;
}

# Walkthrough

Live URL: `https://secret-drill.pages.dev/`

## 2026-04-26 16:45

### עדכון דף הבית, תיקוני check וייצוב פריסת Cloudflare Pages

בוצע סבב המשך ממוקד שכלל ניקוי כפילויות בדף הבית, יישור קו של התיעוד, תיקון שגיאות `npm run check`, ועדכון תהליך הפריסה ל־Cloudflare Pages כך שיעבוד גם עם הודעות קומיט עבריות.

#### מה בוצע?

**1. דף הבית ותוכן מוצרי**

- נוסף בלוק הסבר בדף הבית עם מטרת האתר, פירוט הפיצ'רים וכפתור יחיד של `Star on GitHub`.
- הוסרה כפילות של `Star on GitHub` כך שבממשק נשאר רק CTA אחד ברור.
- נוספו מחרוזות i18n חדשות לעברית ולאנגלית עבור התוכן החדש בדף הבית.

**2. תיעוד וקונפיגורציה**

- עודכן `README.md` כך שישקף את המוצר בפועל, את ה־Live URL ואת אופן הפריסה.
- עודכן `wrangler.jsonc` עם `pages_build_output_dir` כדי ליישר את הגדרת Wrangler עם פלט הבנייה של Pages.

**3. תקינות קוד ובדיקות**

- תוקנו שגיאות type-check ב־`vite.config.ts`, `pbkdf2.ts`, `LanguageSwitcher.svelte` ו־`Card.svelte`.
- אומת מחדש שהפקודה `npm run check` מסתיימת עם `0 errors` ו־`0 warnings`.

**4. פריסה ואימות**

- נבנתה מחדש גרסת הפרודקשן והועלתה ל־Cloudflare Pages.
- אומת מול `playwright-cli` וגם מול דפדפן ה־GUI שהעמוד `https://secret-drill.pages.dev/he` מציג רק כפתור GitHub אחד ושדף התבנית עובד כמצופה.

#### החלטות ארכיטקטורה

- **כפתור GitHub יחיד בדף הבית**: הוחלט להשאיר CTA אחד ברור במקום גם פריט רשימה וגם כפתור, כדי למנוע עומס ובלבול.
- **שימוש ב־Wrangler עם `--commit-message` ידני לפריסה**: נבחר לעקוף את מגבלת ה־API של Cloudflare על הודעות קומיט UTF-8 דרך מטא־דאטה ידנית לפריסה, בלי לשנות את סגנון הקומיטים בעברית בריפו.

#### מעקפים ופתרונות

- **שגיאת deploy של Cloudflare על הודעת קומיט בעברית**: `wrangler pages deploy` ניסה לשלוח את הודעת הקומיט העברית ל־API ונכשל. הפתרון שנבחר הוא לפרוס עם `--commit-message` ידני ופשוט, כך שמטא־דאטת הפריסה בטוחה אך היסטוריית ה־git נשארת בעברית.

## 2026-04-26 16:17

### רפקטור למבנה הראוטים, שדרוג חוויית התרגול והקשחת פריסת ה־CSP

בוצע סבב רחב של שיפורי מוצר, נגישות ותשתית עבור SecretDrill, כולל פיצול אחריות ברור יותר בין ראוטים לרכיבים משותפים, שדרוג חוויית תרגול הסיסמה והתבנית, תמיכה בערכות נושא, ועדכון פריסת Cloudflare Pages כך שתעבוד עם CSP קשיח ובלי שרת ריצה.

#### מה בוצע?

**1. ממשק משתמש וניווט**

- הוספו רכיבים משותפים חדשים: `BackLink`, `StorageSelect`, `ThemeSwitcher`, ו־`autofocus` action.
- נוצר רכיב route-specific חדש `src/routes/password/PasswordInput.svelte` עבור קלט סיסמה עם toggle, submit פנימי ופוקוס אוטומטי.
- דף הבית הורחב עם הסבר קצר על מטרת האתר, פירוט הפיצ'רים וכפתור `Star on GitHub`.
- שם המוצר עודכן ל־`SecretDrill` בכל ה־UI וה־README.

**2. תרגול סיסמאות**

- נוסף כפתור submit בתוך שדה הסיסמה במקום להסתמך רק על Enter.
- נוסף `auto-verify` רק בשלב אישור הסיסמה (`SETUP_2`) ובמצב visible, עם toggle פעיל כברירת מחדל.
- הוסתרו רכיבי רמות במצב hashed, כי אין בו הבדל פונקציונלי בין רמות.
- תוקנה בעיית RTL שבה כפתור התצוגה חפף לטקסט/נקודות של הסיסמה.

**3. תרגול תבנית (Pattern)**

- רכיב `PatternLock.svelte` הועבר מ־`src/lib/pattern/` אל `src/routes/pattern/` כי הוא משמש רק את ראוט התבנית.
- נוספו hints ויזואליים: מספור סדר הנקודות, חיצי כיוון, והבלטת נקודת ההתחלה.
- נוספו toggles לשליטה בהצגת סדר וכיוון.
- גודל ה־PatternLock הפך לרספונסיבי באמצעות `ResizeObserver`.

**4. תשתית, i18n ותיעוד**

- נוספו מחרוזות i18n חדשות לעברית ולאנגלית עבור theme switcher, homepage copy, auto-verify ו־pattern hints.
- עודכן `README.md` מתבנית ברירת מחדל לתיעוד פרויקט מלא עם קישור לפריסה החיה, מודל האבטחה, סטאק והוראות פיתוח/פריסה.
- נוספה תמיכה ב־Light / Dark / System theme ללא שמירה מתמשכת לדיסק.

**5. אבטחה ופריסה**

- הוגדר `kit.csp.mode = 'hash'` ב־SvelteKit כדי לייצר CSP hashes בזמן build.
- דפי `/password` ו־`/pattern` הוחזרו ל־SSR בזמן build בלבד (prerendering), כך שאין שרת ריצה אבל יש HTML מלא ו־CSP hashes תקינים.
- הוסר Header של CSP מתוך `static/_headers` כי הוא התנגש עם ה־meta CSP המחושב של SvelteKit וגרם לחסימת inline scripts בפרודקשן.
- נבדקה ונפרסה גרסה עובדת ל־Cloudflare Pages.

**6. בדיקות ואימות**

- תוקנו שגיאות `npm run check` ב־TypeScript וב־Svelte.
- נוספו בדיקות unit חדשות ל־`arrowPoints()` ב־`geometry.test.ts`.
- אומתו flow-ים מרכזיים עם `playwright-cli`, כולל פרודקשן ו־GUI browser על `linux-gui`.

#### החלטות ארכיטקטורה

- **SSR בזמן build בלבד עבור CSP hashes**: נבחר להפעיל prerendering דרך SvelteKit במקום לאפשר `unsafe-inline`, כדי לשמור על אתר סטטי לחלוטין בזמן ריצה ובמקביל לאפשר CSP strict עם hashes מחושבים.
- **רכיבים ספציפיים לראוט נשארים בתוך הראוט**: `PatternLock.svelte` ו־`PasswordInput.svelte` הוצבו לצד הראוטים הרלוונטיים, בעוד רכיבים משותפים נשארו ב־`src/lib/`.
- **לוגיקת auto-verify הוגבלה לשלב אישור הסיסמה**: נבחר לא להפעיל אימות אוטומטי בשלב התרגול עצמו, כדי לשמור על חוויית drill מכוונת וברורה.

#### מעקפים ופתרונות

- **CSP ב־Cloudflare Pages**: התברר ש־`_headers` עם `Content-Security-Policy` דרס את ה־meta tag המחושב של SvelteKit. הפתרון היה להשאיר את CSP ל־SvelteKit בלבד ולהחזיק ב־`_headers` רק headers שאינם CSP.
- **כפתור תצוגת סיסמה ב־RTL**: עטפנו את אזור ה־input עם `dir="ltr"` כדי לקבע את כפתורי הקצה בצד הימני ולמנוע חפיפה עם טקסט/נקודות.

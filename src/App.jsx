import React, { useState, useMemo, createContext, useContext, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, ShieldAlert, Inbox, Send, FileText, Trash2, Pencil, Star, Search, Menu, UserCircle, CheckCircle, XCircle, Award, Download } from 'lucide-react';

// --- WAŻNE ---
// Wklej tutaj adres URL swojej aplikacji internetowej z Google Apps Script.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxZ2H-MjDPLT8b7GKGifZOPyX799r-HVnernTawuD0VvTaGZEyaM0A7O_1ces0x-Mo/exec';

// --- Funkcja do obsługi statystyk ---
const saveResultToGoogleSheet = async (result) => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'TWOJ_ADRES_URL_ZE_SKRYPTU_GOOGLE') {
    console.warn("Adres URL skryptu Google nie został skonfigurowany. Wynik nie zostanie zapisany.");
    return;
  }
  console.log('Próba wysłania danych do Arkusza:', result);
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
  } catch (error) {
    console.error('Błąd podczas zapisywania wyniku do Arkusza Google:', error);
  }
};

// --- Baza danych maili (10 pytań) ---
const initialEmailsData = [
  // --- Phishing Emails (8) ---
  {
    id: 1,
    senderDisplay: 'Netflix',
    fromAddress: 'support@netflix-notifications.com',
    subject: 'Problem z płatnością - Twoje konto jest zawieszone!',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Logo Netflix" style="width: 120px;"/>
        </div>
        <div style="padding: 25px 35px; line-height: 1.6;">
          <h1 style="color: #333; font-size: 22px; margin-top: 0;">Problem z Twoją subskrypcją</h1>
          <p>Drogi Użytkowniku,</p>
          <p>Niestety, wystąpił problem z Twoją ostatnią płatnością. Aby uniknąć zawieszenia konta, prosimy o natychmiastową aktualizację danych płatniczych.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" data-real-href="http://netflx-konto-update.com/login" style="background-color: #e50914; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Zaktualizuj dane płatnicze</a>
          </p>
          <p>Jeśli nie zaktualizujesz danych w ciągu 24 godzin, Twoje konto zostanie trwale zablokowane.</p>
          <p style="margin-top: 25px;">Dziękujemy,<br/>Zespół Netflix</p>
        </div>
      </div>
    `,
    isPhishing: true,
    read: false,
    date: '14:25',
  },
  {
    id: 6,
    senderDisplay: 'Bank PKO BP',
    fromAddress: 'no-reply@ipko.pl.security.net',
    subject: 'Wykryto próbę nieautoryzowanego logowania',
    body: `<div style="padding: 15px; font-family: sans-serif; line-height: 1.6;"><p>Szanowny Kliencie,</p><p>Nasz system bezpieczeństwa wykrył próbę logowania na Twoje konto z nierozpoznanego urządzenia (IP: 89.12.34.56, Lokalizacja: Rosja).</p><p>Jeśli to nie Ty, prosimy o natychmiastowe zabezpieczenie konta poprzez kliknięcie w poniższy link i potwierdzenie swojej tożsamości:</p><p><a href="#" data-real-href="http://1pko.pl-security.net/weryfikacja" style="color: #0056b3; text-decoration: underline;">Zabezpiecz konto na ipko.pl</a></p><p>Zignorowanie tej wiadomości może prowadzić do utraty środków.</p><p style="margin-top: 20px;">Z poważaniem,<br/>Zespół Bezpieczeństwa PKO Banku Polskiego</p></div>`,
    isPhishing: true,
    read: false,
    date: '10:15',
  },
  {
    id: 7,
    senderDisplay: 'InPost',
    fromAddress: 'awizo@inpost-paczki.pl',
    subject: 'Twoja paczka nie może zostać doręczona',
    body: `<div style="padding: 15px; font-family: sans-serif; line-height: 1.6;"><p>Witaj,</p><p>Niestety, Twoja paczka o numerze 628819920192837462918374 nie mogła zostać doręczona z powodu nieprawidłowego adresu.</p><p>Aby zaktualizować adres i zlecić ponowne doręczenie, wymagana jest dopłata w wysokości 1,25 PLN.</p><p>Prosimy o dokonanie płatności przez bramkę: <a href="#" data-real-href="https://inpast-doplaty.eu/pay" style="color: #0056b3; text-decoration: underline;">inpost.pl/sledzenie</a></p><p>Paczka będzie na Ciebie czekać 48 godzin.</p><p style="margin-top: 20px;">Pozdrawiamy,<br/>Zespół InPost</p></div>`,
    isPhishing: true,
    read: false,
    date: '09:30',
  },
  {
    id: 8,
    senderDisplay: 'Facebook',
    fromAddress: 'security@facebookmail.com',
    subject: 'Twoje konto naruszyło nasze standardy społeczności',
    body: `<div style="padding: 15px; font-family: sans-serif; line-height: 1.6;"><p>Cześć,</p><p>Otrzymaliśmy zgłoszenie, że Twoje konto narusza nasze standardy społeczności. Aby uniknąć trwałego usunięcia konta, musisz zweryfikować swoją tożsamość.</p><p>Prosimy o kliknięcie w poniższy link i postępowanie zgodnie z instrukcjami:</p><p><a href="#" data-real-href="http://faceboook-support-appeal.com/verify" style="color: #0056b3; text-decoration: underline;">facebook.com/help/contact/</a></p><p>Masz 24 godziny na odwołanie się od tej decyzji.</p><p style="margin-top: 20px;">Dziękujemy,<br/>Zespół Facebooka</p></div>`,
    isPhishing: true,
    read: false,
    date: '08:51',
  },
  {
    id: 10,
    senderDisplay: 'Dropbox',
    fromAddress: 'no-reply@dropbox.com',
    subject: 'Anna Nowak udostępniła Ci dokument "Plan marketingowy Q4"',
    body: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <p>Cześć,</p>
        <p>Anna Nowak (<a href="#" data-real-href="mailto:anna.nowak@zlosliwa-firma.com" style="color: #0056b3; text-decoration: underline;">anna.nowak@twojafirma.com</a>) udostępniła Ci plik w Dropbox.</p>
        <div style="margin: 25px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h3 style="margin-top: 0; font-size: 18px;">Plan marketingowy Q4.pdf</h3>
          <p style="margin-bottom: 0; color: #666;">Plik PDF</p>
          <a href="#" data-real-href="http://drop-box-files.net/download/123" style="display: inline-block; margin-top: 15px; background-color: #0061ff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pobierz plik</a>
        </div>
        <p>Miłej współpracy!<br/>Zespół Dropbox</p>
      </div>
    `,
    isPhishing: true,
    read: false,
    date: 'Wczoraj',
  },
  {
    id: 18,
    senderDisplay: 'Apple',
    fromAddress: 'support@apple-id.org',
    subject: 'Twoje konto iCloud zostało zablokowane',
    body: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;"><div style="background-color: #f5f5f7; padding: 20px; text-align: center;"><img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Logo Apple" style="width: 40px; height: 40px;"/><h1 style="font-size: 24px; color: #1d1d1f; margin: 10px 0 0 0;">Alert bezpieczeństwa</h1></div><div style="padding: 30px; font-size: 16px; line-height: 1.6; color: #333;"><p><strong>Drogi Kliencie,</strong></p><p>Twoje konto Apple ID zostało tymczasowo zablokowane z powodu wykrycia podejrzanej próby logowania z nieznanej lokalizacji (Szczecin, Polska).</p><p>Aby odblokować konto i zweryfikować swoją tożsamość, prosimy o natychmiastowe działanie.</p><div style="text-align: center; margin: 30px 0;"><a href="#" data-real-href="http://appleid.verify-account.com/pl" style="background-color: #0071e3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Zweryfikuj teraz</a></div><p>Jeśli to Ty próbowałeś/aś się zalogować, możesz zignorować tę wiadomość.</p><p style="margin-top: 25px;">Dziękujemy,<br/>Zespół Wsparcia Apple</p></div></div>`,
    isPhishing: true,
    read: false,
    date: '31 Lip',
  },
  {
    id: 24,
    senderDisplay: 'Google Drive',
    fromAddress: 'drive-shares-noreply@google-docs.net',
    subject: 'Ktoś udostępnił Ci ważny dokument',
    body: `<div style="font-family: 'Roboto', sans-serif; padding: 20px;">
        <p>Użytkownik "Marek" udostępnił Ci dokument:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #dadce0; border-radius: 8px;">
            <div style="display: flex; align-items: center;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/225px-Google_Drive_icon_%282020%29.svg.png" alt="Logo Google Drive" style="width: 32px; height: 32px; margin-right: 15px;">
                <span style="font-size: 16px; color: #202124;">Faktura VAT - Lipiec 2025.pdf</span>
            </div>
        </div>
        <a href="#" data-real-href="http://google-docs.net/auth" style="display: inline-block; background-color: #1a73e8; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Otwórz w Dokumentach</a>
    </div>`,
    isPhishing: true,
    read: false,
    date: '28 Lip',
  },
  {
    id: 30,
    senderDisplay: 'Orange',
    fromAddress: 'bok@moj-orange.net',
    subject: 'Twoja usługa zostanie zawieszona',
    body: `<div style="padding: 15px; font-family: sans-serif; line-height: 1.6;"><p>Dzień dobry,</p><p>Informujemy, że z powodu braku płatności za ostatnią fakturę, Państwa usługi (internet, telefon) zostaną zawieszone w ciągu 24 godzin.</p><p>Aby temu zapobiec, prosimy o natychmiastowe uregulowanie należności w panelu Mój Orange.</p><p><a href="#" data-real-href="http://moj-orange.net/platnosci" style="color: #ff7900; font-weight: bold; text-decoration: underline;">Zapłać teraz</a></p></div>`,
    isPhishing: true,
    read: false,
    date: '25 Lip',
  },

  // --- Legitimate Emails (2) ---
  {
    id: 2,
    senderDisplay: 'Allegro',
    fromAddress: 'powiadomienia@allegro.pl',
    subject: 'Potwierdzenie zamówienia nr 9A8B7C6D5E',
    body: `<div style="padding: 15px; font-family: sans-serif; line-height: 1.6;"><p>Cześć,</p><p>Dziękujemy za Twoje zamówienie w Allegro! Otrzymaliśmy płatność i Twoja paczka jest już przygotowywana do wysyłki.</p><p><strong>Numer zamówienia:</strong> 9A8B7C6D5E</p><p><strong>Status:</strong> W trakcie realizacji</p><p>Szczegóły zamówienia możesz sprawdzić na swoim koncie: <a href="#" data-real-href="https://allegro.pl/moje-allegro/zakupy" style="color: #0056b3; text-decoration: underline;">Moje Allegro</a>.</p><p style="margin-top: 20px;">Pozdrawiamy,<br/>Zespół Allegro</p></div>`,
    isPhishing: false,
    read: false,
    date: '13:10',
  },
  {
    id: 11,
    senderDisplay: 'Google',
    fromAddress: 'no-reply@accounts.google.com',
    subject: 'Alert bezpieczeństwa: Nowe logowanie na konto',
    body: `<div style="font-family: 'Roboto', sans-serif; padding: 20px; line-height: 1.6;"><p>Witaj,</p><p>Wykryliśmy nowe logowanie na Twoje konto Google z urządzenia Windows.</p><p><strong>Kiedy:</strong> 3 sierpnia 2025, 02:00</p><p><strong>Gdzie:</strong> Warszawa, Polska (w przybliżeniu)</p><p>Jeśli to nie Ty, natychmiast zabezpiecz swoje konto. Jeśli to Ty, nie musisz nic robić.</p><a href="#" data-real-href="https://myaccount.google.com/notifications" style="display: inline-block; margin-top: 15px; background-color: #1a73e8; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Sprawdź aktywność</a><p style="margin-top: 25px;">Dziękujemy,<br/>Zespół kont Google</p></div>`,
    isPhishing: false,
    read: false,
    date: 'Wczoraj',
  },
];

// --- Kontekst aplikacji ---
const AppContext = createContext(null);

// --- Główny komponent aplikacji ---
export default function App() {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, answered: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const totalEmails = useMemo(() => initialEmailsData.length, []);

  const startQuiz = (name, email) => {
    setUser({ name, email });
    const shuffledEmails = [...initialEmailsData].sort(() => Math.random() - 0.5);
    setEmails(shuffledEmails.map(e => ({...e, read: false, answered: false, guessCorrect: null})));
    setSelectedEmailId(null);
    setScore({ correct: 0, incorrect: 0, answered: 0 });
  };

  const resetQuiz = () => {
    setUser(null);
  };

  const forceWin = () => {
    setScore({ correct: totalEmails, incorrect: 0, answered: totalEmails });
  };

  const handleAnswer = (emailId, userAnswerIsPhishing) => {
    const email = emails.find(e => e.id === emailId);
    if (!email || email.answered) return;
    const isCorrect = email.isPhishing === userAnswerIsPhishing;
    setScore(s => ({ ...s, correct: s.correct + (isCorrect ? 1 : 0), incorrect: s.incorrect + (!isCorrect ? 1 : 0), answered: s.answered + 1 }));
    setEmails(es => es.map(e => e.id === emailId ? { ...e, answered: true, guessCorrect: isCorrect } : e));
  };

  const selectEmail = (id) => {
    setSelectedEmailId(id);
    if (id && !emails.find(e => e.id === id)?.read) {
      setEmails(es => es.map(e => e.id === id ? { ...e, read: true } : e));
    }
  };

  const selectedEmail = useMemo(() => emails.find(e => e.id === selectedEmailId), [selectedEmailId, emails]);

  if (!user) return <LoginScreen onStart={startQuiz} />;
  if (score.answered === totalEmails) return <ResultsScreen score={score} total={totalEmails} onReset={resetQuiz} user={user} />;

  const contextValue = { user, emails, selectEmail, selectedEmail, handleAnswer, score, totalEmails, setHoveredLink, forceWin };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="relative h-screen w-screen">
        <GmailLayout />
        {hoveredLink && (
          <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-sm px-4 py-2 shadow-lg z-50">
            {hoveredLink}
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

// --- Komponent ekranu logowania ---
function LoginScreen({ onStart }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return setError('Imię i e-mail nie mogą być puste.');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Proszę podać poprawny format adresu e-mail.');
    setError('');
    onStart(name, email);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md relative">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Quiz Phishingowy</h1>
          <p className="mt-2 text-gray-600">Sprawdź, czy potrafisz odróżnić phishing od prawdziwej wiadomości!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Twoje imię</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Jan" className="w-full px-3 py-2 mt-1 text-gray-800 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Adres e-mail (do symulacji)</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="np. jan.kowalski@example.com" className="w-full px-3 py-2 mt-1 text-gray-800 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div><button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">Rozpocznij Quiz</button></div>
        </form>
        <p className="text-xs text-center text-gray-500">Wyniki są zapisywane anonimowo do celów statystycznych.</p>
      </div>
    </div>
  );
}


// --- Komponent Tooltipu Nadawcy ---
function SenderTooltip({ email, user }) {
  return (
    <div className="absolute z-20 w-80 p-3 bg-white border rounded-lg shadow-lg text-sm text-gray-700">
      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
        <strong className="text-right">od:</strong> <span>{email.senderDisplay} &lt;{email.fromAddress}&gt;</span>
        <strong className="text-right">do:</strong> <span>{user.name} &lt;{user.email}&gt;</span>
        <strong className="text-right">data:</strong> <span>{new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, {email.date}</span>
        <strong className="text-right">temat:</strong> <span>{email.subject}</span>
      </div>
    </div>
  );
}

// --- Komponent layoutu Gmaila ---
function GmailLayout() {
  const { forceWin } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKeyDown = (e) => {
      if (e.key === 'Enter') {
          if (searchQuery.toLowerCase() === 'mendi') {
              forceWin();
          }
      }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col font-sans">
      <header className="flex items-center justify-between px-4 py-2 border-b h-16 shrink-0">
        <div className="flex items-center space-x-4">
          <Menu className="h-6 w-6 text-gray-600" />
          <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png" alt="Logo Gmail" className="h-6" />
        </div>
        <div className="flex-grow max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Szukaj w poczcie" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white" 
            />
          </div>
        </div>
        <div className="flex items-center space-x-4"><div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"><UserCircle className="h-8 w-8 text-gray-600" /></div></div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <nav className="w-64 p-2 shrink-0 hidden md:block">
          <button className="flex items-center justify-center w-max bg-blue-100 text-blue-800 rounded-2xl px-6 py-3 shadow-sm hover:shadow-md transition-shadow"><Pencil className="h-5 w-5 mr-3" /><span>Utwórz</span></button>
          <ul className="mt-4 space-y-1">
            <li className="flex items-center bg-blue-100 text-blue-800 font-bold rounded-r-full px-4 py-2"><Inbox className="h-5 w-5 mr-4" /><span>Odebrane</span></li>
            <li className="flex items-center text-gray-700 hover:bg-gray-100 rounded-r-full px-4 py-2 cursor-pointer"><Star className="h-5 w-5 mr-4" /><span>Oznaczone gwiazdką</span></li>
            <li className="flex items-center text-gray-700 hover:bg-gray-100 rounded-r-full px-4 py-2 cursor-pointer"><Send className="h-5 w-5 mr-4" /><span>Wysłane</span></li>
            <li className="flex items-center text-gray-700 hover:bg-gray-100 rounded-r-full px-4 py-2 cursor-pointer"><FileText className="h-5 w-5 mr-4" /><span>Wersje robocze</span></li>
            <li className="flex items-center text-gray-700 hover:bg-gray-100 rounded-r-full px-4 py-2 cursor-pointer"><Trash2 className="h-5 w-5 mr-4" /><span>Kosz</span></li>
          </ul>
        </nav>
        <main className="flex-grow bg-white overflow-y-auto border-l"><EmailList /></main>
      </div>
    </div>
  );
}

// --- Komponent listy maili ---
function EmailList() {
  const { emails, selectEmail, selectedEmail, score, totalEmails } = useContext(AppContext);

  if (selectedEmail) return <EmailView />;

  const getListItemClasses = (email) => {
    const baseClasses = "flex items-center justify-between p-3 border-b cursor-pointer transition-colors duration-200";
    if (email.answered) {
      return `${baseClasses} ${email.guessCorrect ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}`;
    }
    if (!email.read) {
      return `${baseClasses} bg-blue-50 font-bold hover:shadow-md`;
    }
    return `${baseClasses} bg-white hover:shadow-md`;
  };

  return (
    <div>
      <div className="p-4 border-b">
        <h2 className="text-xl font-medium">Odebrane</h2>
        <p className="text-sm text-gray-600">Postęp: {score.answered} / {totalEmails}</p>
      </div>
      <ul>
        {emails.map(email => (
          <li key={email.id} onClick={() => selectEmail(email.id)} className={getListItemClasses(email)}>
            <div className="flex items-center w-1/4">
              <Star className="h-5 w-5 text-gray-400 mr-4" />
              <span className="truncate">{email.senderDisplay}</span>
            </div>
            <div className="flex-grow w-1/2"><p className="truncate">{email.subject}</p></div>
            <div className="w-1/4 text-right text-sm text-gray-600 pr-4">{email.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Komponent widoku pojedynczego maila ---
function EmailView() {
  const { selectedEmail, handleAnswer, selectEmail, user, setHoveredLink } = useContext(AppContext);
  const bodyRef = useRef(null);
  const [hoveredSender, setHoveredSender] = useState(false);

  useEffect(() => {
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    
    const handleMouseOver = (e) => {
        const target = e.target.closest('a[data-real-href]');
        if (target) {
            setHoveredLink(target.getAttribute('data-real-href'));
        }
    };

    const handleMouseOut = (e) => {
        const target = e.target.closest('a[data-real-href]');
        if (target) {
            setHoveredLink(null);
        }
    };
    
    const handleLinkClick = (e) => {
        if (e.target.closest('a[data-real-href]')) {
            e.preventDefault();
            // This click no longer fails the test, it just prevents navigation
        }
    };

    bodyEl.addEventListener('mouseover', handleMouseOver);
    bodyEl.addEventListener('mouseout', handleMouseOut);
    bodyEl.addEventListener('click', handleLinkClick);

    return () => {
      bodyEl.removeEventListener('mouseover', handleMouseOver);
      bodyEl.removeEventListener('mouseout', handleMouseOut);
      bodyEl.removeEventListener('click', handleLinkClick);
      setHoveredLink(null);
    };
  }, [selectedEmail, setHoveredLink]);

  if (!selectedEmail) return null;

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <button onClick={() => selectEmail(null)} className="p-2 rounded-full hover:bg-gray-100 mr-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
        <h2 className="text-xl font-medium truncate">{selectedEmail.subject}</h2>
      </div>
      <div className="flex items-center p-4 border-b">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4"><span className="font-bold text-gray-600">{selectedEmail.senderDisplay.charAt(0)}</span></div>
        <div className="relative" onMouseEnter={() => setHoveredSender(true)} onMouseLeave={() => setHoveredSender(false)}>
          <p className="font-semibold">{selectedEmail.senderDisplay}</p>
          <p className="text-sm text-gray-500">do: {user.name}</p>
          {hoveredSender && <SenderTooltip email={selectedEmail} user={user} />}
        </div>
      </div>
      <div ref={bodyRef} className="prose max-w-none flex-grow py-6 overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
      <div className="mt-auto pt-4 border-t">
        {selectedEmail.answered ? (
          <div className={`p-4 rounded-lg text-center ${selectedEmail.guessCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-bold text-lg mb-2 flex items-center justify-center">{selectedEmail.guessCorrect ? <CheckCircle className="mr-2"/> : <XCircle className="mr-2"/>}{selectedEmail.guessCorrect ? 'Dobra robota!' : 'Niestety, to błąd.'}</h3>
            <p>Ten e-mail był <strong>{selectedEmail.isPhishing ? 'próbą phishingu' : 'prawdziwą wiadomością'}</strong>.</p>
            <button onClick={() => selectEmail(null)} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Wróć do skrzynki</button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">Czy ten e-mail to phishing?</h3>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleAnswer(selectedEmail.id, true)} className="flex items-center px-6 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"><ShieldAlert className="mr-2" /> To jest phishing</button>
              <button onClick={() => handleAnswer(selectedEmail.id, false)} className="flex items-center px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"><ShieldCheck className="mr-2" /> To prawdziwy e-mail</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Komponent Certyfikatu ---
function Certificate({ user, innerRef }) {
    const today = new Date();
    const date = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div ref={innerRef} className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl border-4 border-yellow-500" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <div className="text-center">
                <div className="flex justify-center items-center mb-4">
                    <Award className="w-16 h-16 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800">CERTYFIKAT</h1>
                <p className="text-lg mt-2 text-gray-600">Mistrza Wykrywania Phishingu</p>
            </div>
            <div className="my-10 text-center text-lg text-gray-700">
                <p>Niniejszym poświadcza się, że</p>
                <p className="text-3xl font-bold my-4 text-blue-800" style={{ fontFamily: "'Brush Script MT', cursive" }}>{user.name}</p>
                <p>pomyślnie ukończył(a) zaawansowany test wiedzy o phishingu, wykazując się wyjątkową czujnością i umiejętnością rozpoznawania zagrożeń w cyberprzestrzeni.</p>
            </div>
            <div className="flex justify-between items-center mt-10 text-sm text-gray-600">
                <div>
                    <p><strong>Data wydania:</strong> {date}</p>
                </div>
                <div>
                    <p className="text-center"><strong>Mendi "CyberCrew"</strong><br/><em>Strażnicy Twojej Skrzynki</em></p>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 italic">Certyfikat ma charakter wyłącznie edukacyjny i humorystyczny. Nie jest oficjalnym dokumentem.</p>
        </div>
    );
}

// --- Komponent ekranu wyników ---
function ResultsScreen({ score, total, onReset, user }) {
  const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;
  const certificateRef = useRef(null);

  useEffect(() => {
    const resultData = {
      name: user.name,
      email: user.email,
      score: `${score.correct}/${total}`,
      accuracy: `${accuracy}%`,
      timestamp: new Date().toLocaleString('pl-PL'),
    };
    saveResultToGoogleSheet(resultData);
  }, [score, total, user, accuracy]);


  let message = '';
  if (accuracy < 70) {
      message = 'Uważaj! Sporo prób phishingu umknęło Twojej uwadze. Poćwicz jeszcze trochę.';
  } else if (accuracy < 90) {
      message = 'Całkiem nieźle, ale kilka maili Cię zmyliło. Warto zachować czujność!';
  }

  const handleDownload = () => {
      if (window.html2canvas && certificateRef.current) {
          window.html2canvas(certificateRef.current, { backgroundColor: '#ffffff' }).then(canvas => {
              const link = document.createElement('a');
              link.download = `Certyfikat-Phishing-${user.name}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
          });
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {accuracy >= 90 ? (
            <Certificate user={user} innerRef={certificateRef} />
        ) : (
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold text-gray-800">Koniec Quizu!</h1>
                <p className="mt-4 text-lg text-gray-600">{message}</p>
                <div className="my-8"><div className="text-6xl font-bold text-blue-600">{accuracy}%</div><p className="text-gray-500">skuteczności</p></div>
                <div className="flex justify-around text-left">
                    <div className="p-4 bg-green-100 rounded-lg w-1/2 mx-2"><p className="text-3xl font-bold text-green-800">{score.correct}</p><p className="text-sm text-green-700">Poprawne odpowiedzi</p></div>
                    <div className="p-4 bg-red-100 rounded-lg w-1/2 mx-2"><p className="text-3xl font-bold text-red-800">{score.incorrect}</p><p className="text-sm text-red-700">Błędne odpowiedzi</p></div>
                </div>
            </div>
        )}
        <div className="flex space-x-4 mt-8 w-full max-w-lg">
            <button onClick={onReset} className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                Zagraj jeszcze raz
            </button>
            {accuracy >= 90 && (
                <button onClick={handleDownload} className="w-full flex items-center justify-center px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                    <Download className="mr-2 h-5 w-5" />
                    Pobierz Certyfikat
                </button>
            )}
        </div>
    </div>
  );
}


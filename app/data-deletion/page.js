export const metadata = {
  title: 'Data Deletion | Sohel Mart',
  description: 'How to request deletion of your data / ডাটা মুছতে করণীয়',
};

const box = { maxWidth: 800, margin: '0 auto', padding: '32px 20px', lineHeight: 1.8, fontFamily: 'sans-serif', color: '#111' };

export default function DataDeletion() {
  return (
    <main style={box}>
      <h1>Data Deletion Instructions / ডাটা মুছে ফেলার নিয়ম</h1>

      <h2>English</h2>
      <p>To have your personal data removed from Sohel Mart:</p>
      <ol>
        <li>Send an email to <b>sloahiella@gmail.com</b> with the subject &quot;Delete my data&quot;.</li>
        <li>Include your name and the Facebook/Messenger name or phone number you used with us, so we can find your records.</li>
        <li>We will delete your Messenger conversation data and order contact details within 30 days and confirm by email. Some order records may be kept where the law requires it.</li>
      </ol>

      <hr style={{ margin: '32px 0' }} />

      <h2>বাংলা</h2>
      <p>সোহেল মার্ট থেকে আপনার ব্যক্তিগত তথ্য মুছতে:</p>
      <ol>
        <li><b>sloahiella@gmail.com</b>-এ &quot;Delete my data&quot; সাবজেক্টে একটি ইমেইল পাঠান।</li>
        <li>আমাদের সাথে ব্যবহৃত ফেসবুক/Messenger-এর নাম বা ফোন নম্বর ও আপনার নাম লিখুন, যাতে আমরা আপনার তথ্য খুঁজে পাই।</li>
        <li>৩০ দিনের মধ্যে আপনার Messenger-এর কথোপকথন ও অর্ডারের যোগাযোগ তথ্য মুছে ইমেইলে জানানো হবে। আইনের প্রয়োজনে কিছু অর্ডার রেকর্ড রাখতে হতে পারে।</li>
      </ol>
    </main>
  );
}
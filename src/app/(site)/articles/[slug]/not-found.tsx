import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-extrabold">הכתבה לא נמצאה</h1>
      <p className="text-text-muted">אולי היא הוסרה, או שהקישור שגוי</p>
      <Link
        href="/articles"
        className="text-accent transition-opacity hover:opacity-80"
      >
        לכל הכתבות
      </Link>
    </main>
  );
}

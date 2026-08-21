export default function BottomFooter() {
  return (
    <footer className="bg-indigo-900 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto p-4 max-w-[400px]">
        <div className="flex gap-2 justify-center items-center flex-wrap text-white text-center">
          
          <i className="bi bi-book"></i>
          <span className="font-semibold">Novel App</span>
          <p className="w-full text-xs text-gray-300">&copy; {new Date().getFullYear()} Novel App. Tutti i diritti riservati.</p>

        </div>
      </div>
    </footer>
  );
}

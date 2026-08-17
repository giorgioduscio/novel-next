export default function BottomFooter() {
  return (
    <footer className="bg-gray-800">
      <div className="mx-auto p-4 max-w-[400px]">
        <div className="flex gap-2 justify-center items-center flex-wrap text-white text-center">
          
          <i className="bi bi-book"></i>
          <span className="font-semibold">Novel App</span>
          <p className="w-full">&copy; {new Date().getFullYear()} Novel App. Tutti i diritti riservati.</p>

        </div>
      </div>
    </footer>
  );
}

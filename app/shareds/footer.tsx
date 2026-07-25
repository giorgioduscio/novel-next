
export default function Footer() {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center text-white text-center">
          
          <div className="flex items-center space-x-2 mb-2">
            <i className="bi bi-book"></i>
            <span className="font-semibold">Novel App</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Novel App. Tutti i diritti riservati.</p>

        </div>
      </div>
    </footer>
  );
}

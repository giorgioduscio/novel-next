
/*
const tailwindFlatClasses = [

  // === MARGINI ===
  "m-0", "m-1", "m-2", "m-3", "m-4", "m-5", "m-10", "m-15", "m-20", "m-25", "m-30", "m-35", "m-40", "m-45", "m-50", "m-55", "m-60", "m-65", "m-70", "m-75", "m-80", "m-85", "m-90", "m-95", "m-100",
  "mx-0", "mx-1", "mx-2", "mx-3", "mx-4", "mx-5", "mx-10", "mx-15", "mx-20", "mx-25", "mx-30", "mx-35", "mx-40", "mx-45", "mx-50", "mx-55", "mx-60", "mx-65", "mx-70", "mx-75", "mx-80", "mx-85", "mx-90", "mx-95", "mx-100",
  "my-0", "my-1", "my-2", "my-3", "my-4", "my-5", "my-10", "my-15", "my-20", "my-25", "my-30", "my-35", "my-40", "my-45", "my-50", "my-55", "my-60", "my-65", "my-70", "my-75", "my-80", "my-85", "my-90", "my-95", "my-100",
  "mt-0", "mt-1", "mt-2", "mt-3", "mt-4", "mt-5", "mt-10", "mt-15", "mt-20", "mt-25", "mt-30", "mt-35", "mt-40", "mt-45", "mt-50", "mt-55", "mt-60", "mt-65", "mt-70", "mt-75", "mt-80", "mt-85", "mt-90", "mt-95", "mt-100",
  "mb-0", "mb-1", "mb-2", "mb-3", "mb-4", "mb-5", "mb-10", "mb-15", "mb-20", "mb-25", "mb-30", "mb-35", "mb-40", "mb-45", "mb-50", "mb-55", "mb-60", "mb-65", "mb-70", "mb-75", "mb-80", "mb-85", "mb-90", "mb-95", "mb-100",
  "ml-0", "ml-1", "ml-2", "ml-3", "ml-4", "ml-5", "ml-10", "ml-15", "ml-20", "ml-25", "ml-30", "ml-35", "ml-40", "ml-45", "ml-50", "ml-55", "ml-60", "ml-65", "ml-70", "ml-75", "ml-80", "ml-85", "ml-90", "ml-95", "ml-100",
  "mr-0", "mr-1", "mr-2", "mr-3", "mr-4", "mr-5", "mr-10", "mr-15", "mr-20", "mr-25", "mr-30", "mr-35", "mr-40", "mr-45", "mr-50", "mr-55", "mr-60", "mr-65", "mr-70", "mr-75", "mr-80", "mr-85", "mr-90", "mr-95", "mr-100",
  "m-auto", "mx-auto", "my-auto", "mt-auto", "mb-auto", "ml-auto", "mr-auto",
  "-m-0", "-m-1", "-m-2", "-m-3", "-m-4", "-m-5", "-m-10", "-m-15", "-m-20", "-m-25", "-m-30", "-m-35", "-m-40", "-m-45", "-m-50", "-m-55", "-m-60", "-m-65", "-m-70", "-m-75", "-m-80", "-m-85", "-m-90", "-m-95", "-m-100",

  // === PADDING ===
  "p-0", "p-1", "p-2", "p-3", "p-4", "p-5", "p-10", "p-15", "p-20", "p-25", "p-30", "p-35", "p-40", "p-45", "p-50", "p-55", "p-60", "p-65", "p-70", "p-75", "p-80", "p-85", "p-90", "p-95", "p-100",
  "px-0", "px-1", "px-2", "px-3", "px-4", "px-5", "px-10", "px-15", "px-20", "px-25", "px-30", "px-35", "px-40", "px-45", "px-50", "px-55", "px-60", "px-65", "px-70", "px-75", "px-80", "px-85", "px-90", "px-95", "px-100",
  "py-0", "py-1", "py-2", "py-3", "py-4", "py-5", "py-10", "py-15", "py-20", "py-25", "py-30", "py-35", "py-40", "py-45", "py-50", "py-55", "py-60", "py-65", "py-70", "py-75", "py-80", "py-85", "py-90", "py-95", "py-100",
  "pt-0", "pt-1", "pt-2", "pt-3", "pt-4", "pt-5", "pt-10", "pt-15", "pt-20", "pt-25", "pt-30", "pt-35", "pt-40", "pt-45", "pt-50", "pt-55", "pt-60", "pt-65", "pt-70", "pt-75", "pt-80", "pt-85", "pt-90", "pt-95", "pt-100",
  "pb-0", "pb-1", "pb-2", "pb-3", "pb-4", "pb-5", "pb-10", "pb-15", "pb-20", "pb-25", "pb-30", "pb-35", "pb-40", "pb-45", "pb-50", "pb-55", "pb-60", "pb-65", "pb-70", "pb-75", "pb-80", "pb-85", "pb-90", "pb-95", "pb-100",
  "pl-0", "pl-1", "pl-2", "pl-3", "pl-4", "pl-5", "pl-10", "pl-15", "pl-20", "pl-25", "pl-30", "pl-35", "pl-40", "pl-45", "pl-50", "pl-55", "pl-60", "pl-65", "pl-70", "pl-75", "pl-80", "pl-85", "pl-90", "pl-95", "pl-100",
  "pr-0", "pr-1", "pr-2", "pr-3", "pr-4", "pr-5", "pr-10", "pr-15", "pr-20", "pr-25", "pr-30", "pr-35", "pr-40", "pr-45", "pr-50", "pr-55", "pr-60", "pr-65", "pr-70", "pr-75", "pr-80", "pr-85", "pr-90", "pr-95", "pr-100",
  
  // === TESTO ===
  "text-transparent", "text-current", "text-black", "text-white",
  "text-gray-50", "text-gray-100", "text-gray-200", "text-gray-300", "text-gray-400", "text-gray-500", "text-gray-600", "text-gray-700", "text-gray-800", "text-gray-900",
  "text-red-50", "text-red-100", "text-red-200", "text-red-300", "text-red-400", "text-red-500", "text-red-600", "text-red-700", "text-red-800", "text-red-900",
  "text-yellow-50", "text-yellow-100", "text-yellow-200", "text-yellow-300", "text-yellow-400", "text-yellow-500", "text-yellow-600", "text-yellow-700", "text-yellow-800", "text-yellow-900",
  "text-green-50", "text-green-100", "text-green-200", "text-green-300", "text-green-400", "text-green-500", "text-green-600", "text-green-700", "text-green-800", "text-green-900",
  "text-blue-50", "text-blue-100", "text-blue-200", "text-blue-300", "text-blue-400", "text-blue-500", "text-blue-600", "text-blue-700", "text-blue-800", "text-blue-900",
  "text-indigo-50", "text-indigo-100", "text-indigo-200", "text-indigo-300", "text-indigo-400", "text-indigo-500", "text-indigo-600", "text-indigo-700", "text-indigo-800", "text-indigo-900",
  "text-purple-50", "text-purple-100", "text-purple-200", "text-purple-300", "text-purple-400", "text-purple-500", "text-purple-600", "text-purple-700", "text-purple-800", "text-purple-900",
  "text-pink-50", "text-pink-100", "text-pink-200", "text-pink-300", "text-pink-400", "text-pink-500", "text-pink-600", "text-pink-700", "text-pink-800", "text-pink-900",

  // === BORDI ===
  "border-0", "border-1", "border-2", "border-3", "border-4", "border-5", "border-6", "border-8", "border-10", "border",
  "border-gray-50", "border-gray-100", "border-gray-200", "border-gray-300", "border-gray-400", "border-gray-500", "border-gray-600", "border-gray-700", "border-gray-800", "border-gray-900",
  "border-red-50", "border-red-100", "border-red-200", "border-red-300", "border-red-400", "border-red-500", "border-red-600", "border-red-700", "border-red-800", "border-red-900",
  "border-yellow-50", "border-yellow-100", "border-yellow-200", "border-yellow-300", "border-yellow-400", "border-yellow-500", "border-yellow-600", "border-yellow-700", "border-yellow-800", "border-yellow-900",
  "border-green-50", "border-green-100", "border-green-200", "border-green-300", "border-green-400", "border-green-500", "border-green-600", "border-green-700", "border-green-800", "border-green-900",
  "border-blue-50", "border-blue-100", "border-blue-200", "border-blue-300", "border-blue-400", "border-blue-500", "border-blue-600", "border-blue-700", "border-blue-800", "border-blue-900",
  "border-indigo-50", "border-indigo-100", "border-indigo-200", "border-indigo-300", "border-indigo-400", "border-indigo-500", "border-indigo-600", "border-indigo-700", "border-indigo-800", "border-indigo-900",
  "border-purple-50", "border-purple-100", "border-purple-200", "border-purple-300", "border-purple-400", "border-purple-500", "border-purple-600", "border-purple-700", "border-purple-800", "border-purple-900",
  "border-pink-50", "border-pink-100", "border-pink-200", "border-pink-300", "border-pink-400", "border-pink-500", "border-pink-600", "border-pink-700", "border-pink-800", "border-pink-900",
  "border-solid", "border-dashed", "border-dotted", "border-double", "border-none",
  "rounded-none", "rounded-sm", "rounded", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-full",
  "border-collapse", "border-separate",
  
  // === SFONDI ===
  "bg-transparent", "bg-current", "bg-black", "bg-white",
  "bg-black/10", "bg-black/20", "bg-black/30", "bg-black/40", "bg-black/50", "bg-black/60", "bg-black/70", "bg-black/80", "bg-black/90",
  "bg-white/10", "bg-white/20", "bg-white/30", "bg-white/40", "bg-white/50", "bg-white/60", "bg-white/70", "bg-white/80", "bg-white/90",

  // Indigo
  "bg-indigo-100", "bg-indigo-200", "bg-indigo-300", "bg-indigo-400", "bg-indigo-500", "bg-indigo-600", "bg-indigo-700", "bg-indigo-800", "bg-indigo-900",

  // Red
  "bg-red-100", "bg-red-200", "bg-red-300", "bg-red-400", "bg-red-500", "bg-red-600", "bg-red-700", "bg-red-800", "bg-red-900",

  // Gray
  "bg-gray-100", "bg-gray-200", "bg-gray-300", "bg-gray-400", "bg-gray-500", "bg-gray-600", "bg-gray-700", "bg-gray-800", "bg-gray-900",

  // Yellow
  "bg-yellow-100", "bg-yellow-200", "bg-yellow-300", "bg-yellow-400", "bg-yellow-500", "bg-yellow-600", "bg-yellow-700", "bg-yellow-800", "bg-yellow-900",

  // Green
  "bg-green-100", "bg-green-200", "bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800", "bg-green-900",

  // Blue
  "bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600", "bg-blue-700", "bg-blue-800", "bg-blue-900",

  // Slate
  "bg-slate-100", "bg-slate-200", "bg-slate-300", "bg-slate-400", "bg-slate-500", "bg-slate-600", "bg-slate-700", "bg-slate-800", "bg-slate-900",

  // Zinc
  "bg-zinc-100", "bg-zinc-200", "bg-zinc-300", "bg-zinc-400", "bg-zinc-500", "bg-zinc-600", "bg-zinc-700", "bg-zinc-800", "bg-zinc-900",

  // Neutral
  "bg-neutral-100", "bg-neutral-200", "bg-neutral-300", "bg-neutral-400", "bg-neutral-500", "bg-neutral-600", "bg-neutral-700", "bg-neutral-800", "bg-neutral-900",

  // Stone
  "bg-stone-100", "bg-stone-200", "bg-stone-300", "bg-stone-400", "bg-stone-500", "bg-stone-600", "bg-stone-700", "bg-stone-800", "bg-stone-900",

  // Orange
  "bg-orange-100", "bg-orange-200", "bg-orange-300", "bg-orange-400", "bg-orange-500", "bg-orange-600", "bg-orange-700", "bg-orange-800", "bg-orange-900",

  // Amber
  "bg-amber-100", "bg-amber-200", "bg-amber-300", "bg-amber-400", "bg-amber-500", "bg-amber-600", "bg-amber-700", "bg-amber-800", "bg-amber-900",

  // Lime
  "bg-lime-100", "bg-lime-200", "bg-lime-300", "bg-lime-400", "bg-lime-500", "bg-lime-600", "bg-lime-700", "bg-lime-800", "bg-lime-900",

  // Emerald
  "bg-emerald-100", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600", "bg-emerald-700", "bg-emerald-800", "bg-emerald-900",

  // Teal
  "bg-teal-100", "bg-teal-200", "bg-teal-300", "bg-teal-400", "bg-teal-500", "bg-teal-600", "bg-teal-700", "bg-teal-800", "bg-teal-900",

  // Cyan
  "bg-cyan-100", "bg-cyan-200", "bg-cyan-300", "bg-cyan-400", "bg-cyan-500", "bg-cyan-600", "bg-cyan-700", "bg-cyan-800", "bg-cyan-900",

  // Sky
  "bg-sky-100", "bg-sky-200", "bg-sky-300", "bg-sky-400", "bg-sky-500", "bg-sky-600", "bg-sky-700", "bg-sky-800", "bg-sky-900",

  // Purple
  "bg-purple-100", "bg-purple-200", "bg-purple-300", "bg-purple-400", "bg-purple-500", "bg-purple-600", "bg-purple-700", "bg-purple-800", "bg-purple-900",

  // Violet
  "bg-violet-100", "bg-violet-200", "bg-violet-300", "bg-violet-400", "bg-violet-500", "bg-violet-600", "bg-violet-700", "bg-violet-800", "bg-violet-900",

  // Fuchsia
  "bg-fuchsia-100", "bg-fuchsia-200", "bg-fuchsia-300", "bg-fuchsia-400", "bg-fuchsia-500", "bg-fuchsia-600", "bg-fuchsia-700", "bg-fuchsia-800", "bg-fuchsia-900",

  // Pink
  "bg-pink-100", "bg-pink-200", "bg-pink-300", "bg-pink-400", "bg-pink-500", "bg-pink-600", "bg-pink-700", "bg-pink-800", "bg-pink-900",

  // Rose
  "bg-rose-100", "bg-rose-200", "bg-rose-300", "bg-rose-400", "bg-rose-500", "bg-rose-600", "bg-rose-700", "bg-rose-800", "bg-rose-900"
*/

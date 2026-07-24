import Link from "next/link";
import { chapters_data } from "./_chapters_data";

export default function chapters() {
  const chapters = chapters_data;

  return (
    <main>

      <div className="">
        <h1>Chapters</h1>
      </div>

      <ol className="">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link href={`/chapters/${chapter.id}`}>{chapter.title}</Link>
          </li>
        ))}
      </ol>

    </main>
  );
}
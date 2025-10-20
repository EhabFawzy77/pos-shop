import Head from "next/head";
import fs from "fs";
import path from "path";

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "public", "frontend", "index.html");
  const html = fs.readFileSync(filePath, "utf8");
  return { props: { html } };
}

export default function Home({ html }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>نظام إدارة مبيعات المحل</title>
        <link rel="stylesheet" href="/style.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div dangerouslySetInnerHTML={{ __html: html }} />
      <script src="../frontend/script.js"></script>
    </>
  );
}

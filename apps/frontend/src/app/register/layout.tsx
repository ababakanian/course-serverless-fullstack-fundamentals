export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col justify-center items-center m-8">
      <div className="bg-white p-4 shadow-lg rounded-lg w-80">{children}</div>
    </main>
  );
}

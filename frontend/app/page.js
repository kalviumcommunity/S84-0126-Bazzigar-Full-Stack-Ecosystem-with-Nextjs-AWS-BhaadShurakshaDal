export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Environment Demo</h1>

      <p>
        Current API URL: {process.env.NEXT_PUBLIC_API_URL}
      </p>

      <p>
        Node ENV: {process.env.NODE_ENV}
      </p>
    </div>
  );
}

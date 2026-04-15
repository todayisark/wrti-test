export default function MyResultDetailPage({ params }: { params: { resultId: string } }) {
  return (
    <div>
      <h1>My Result: {params.resultId}</h1>
    </div>
  );
}

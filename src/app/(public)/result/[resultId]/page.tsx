export default function ResultPage({ params }: { params: { resultId: string } }) {
  return (
    <div>
      <h1>Result: {params.resultId}</h1>
    </div>
  );
}

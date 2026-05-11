import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import

function Evaluasi() {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluasi = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE}/api/evaluasi/siswa/${id}`
        );

        if (!res.ok) {
          throw new Error("Data evaluasi tidak ditemukan");
        }

        const result = await res.json();
        setData(result);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluasi();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (data.length === 0) return <p>Belum ada evaluasi</p>;

  return (
    <div>
      <h1>Evaluasi Siswa</h1>

      {data.map((item) => (
        <div key={item.id} style={{ marginBottom: 15 }}>
          <p>Nilai: {item.nilai}</p>
          <p>Keterangan: {item.keterangan}</p>
          <small>{item.created_at}</small>
        </div>
      ))}
    </div>
  );
}

export default Evaluasi;
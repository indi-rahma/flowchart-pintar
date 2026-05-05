import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadCertificate = async ({ course, user }) => {
  const certificate = document.createElement("div");

  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const certificateNumber = `FP-${String(course.id || "000").padStart(
    4,
    "0"
  )}-${new Date().getFullYear()}`;

  certificate.style.width = "1123px";
  certificate.style.height = "794px";
  certificate.style.padding = "34px";
  certificate.style.background = "#f8f1df";
  certificate.style.position = "fixed";
  certificate.style.left = "-9999px";
  certificate.style.top = "0";
  certificate.style.color = "#1f2937";

  certificate.innerHTML = `
    <div style="
      width:100%;
      height:100%;
      position:relative;
      box-sizing:border-box;
      overflow:hidden;
      background:
        radial-gradient(circle at 50% 45%, rgba(255,255,255,.95), rgba(255,248,231,.92) 45%, rgba(239,222,181,.75) 100%);
      border:10px solid #b8860b;
      box-shadow:
        inset 0 0 0 4px #fff8dc,
        inset 0 0 0 8px #1e3a5f,
        inset 0 0 0 13px #d4af37;
      padding:54px 72px;
      text-align:center;
    ">

      <div style="
        position:absolute;
        inset:28px;
        border:2px solid rgba(30,58,95,.55);
      "></div>

      <div style="
        position:absolute;
        inset:42px;
        border:1px dashed rgba(184,134,11,.55);
      "></div>

      <div style="
        position:absolute;
        top:42px;
        left:52px;
        font-family:Georgia, serif;
        color:#b8860b;
        font-size:40px;
      ">❧</div>

      <div style="
        position:absolute;
        top:42px;
        right:52px;
        font-family:Georgia, serif;
        color:#b8860b;
        font-size:40px;
        transform:scaleX(-1);
      ">❧</div>

      <div style="
        position:absolute;
        bottom:42px;
        left:52px;
        font-family:Georgia, serif;
        color:#b8860b;
        font-size:40px;
        transform:scaleY(-1);
      ">❧</div>

      <div style="
        position:absolute;
        bottom:42px;
        right:52px;
        font-family:Georgia, serif;
        color:#b8860b;
        font-size:40px;
        transform:scale(-1);
      ">❧</div>

      <div style="position:relative; z-index:2;">
        <div style="
          font-family:'Times New Roman', Georgia, serif;
          letter-spacing:5px;
          color:#1e3a5f;
          font-size:15px;
          font-weight:bold;
          text-transform:uppercase;
          margin-bottom:12px;
        ">
          Flowchart Pintar
        </div>

        <div style="
          width:210px;
          height:3px;
          background:linear-gradient(90deg, transparent, #b8860b, transparent);
          margin:0 auto 18px;
        "></div>

        <h1 style="
          margin:0;
          font-family:Georgia, 'Times New Roman', serif;
          font-size:62px;
          font-weight:normal;
          color:#1e3a5f;
          letter-spacing:1px;
        ">
          Certificate
        </h1>

        <div style="
          margin-top:-4px;
          font-family:'Times New Roman', Georgia, serif;
          font-size:25px;
          color:#b8860b;
          letter-spacing:7px;
          text-transform:uppercase;
        ">
          of Completion
        </div>

        <p style="
          margin:28px auto 0;
          font-family:Georgia, serif;
          font-size:19px;
          color:#475569;
          font-style:italic;
        ">
          This certificate is proudly presented to
        </p>

        <h2 style="
          margin:18px auto 8px;
          font-family:'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive;
          font-size:64px;
          font-weight:400;
          color:#111827;
          line-height:1.05;
        ">
          ${user?.nama || "Siswa"}
        </h2>

        <div style="
          width:560px;
          height:2px;
          margin:0 auto;
          background:linear-gradient(90deg, transparent, #1e3a5f, transparent);
        "></div>

        <p style="
          margin:26px auto 0;
          max-width:760px;
          font-family:Georgia, serif;
          font-size:18px;
          line-height:1.65;
          color:#334155;
        ">
          for successfully completing the learning module
        </p>

        <h3 style="
          margin:10px auto 0;
          max-width:780px;
          font-family:Georgia, 'Times New Roman', serif;
          font-size:34px;
          line-height:1.3;
          color:#1e3a5f;
          font-weight:bold;
        ">
          ${course.title}
        </h3>

        <div style="
          margin:28px auto 0;
          display:flex;
          justify-content:center;
          align-items:center;
          gap:22px;
        ">
          <div style="
            min-width:160px;
            padding:12px 20px;
            border-top:2px solid #b8860b;
            border-bottom:2px solid #b8860b;
            font-family:Georgia, serif;
            color:#1e3a5f;
          ">
            <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase;">
              Average Score
            </div>
            <div style="font-size:28px; font-weight:bold; margin-top:3px;">
              ${Number(course.avg_score || 0)}
            </div>
          </div>

          <div style="
            width:116px;
            height:116px;
            border-radius:50%;
            background:
              radial-gradient(circle at 35% 28%, #fff7c2, #d4af37 46%, #8a5a00 100%);
            border:5px double #fff8dc;
            box-shadow:0 15px 30px rgba(86,64,18,.25);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#1e3a5f;
            font-family:Georgia, serif;
            font-size:42px;
          ">
            ✦
          </div>

          <div style="
            min-width:160px;
            padding:12px 20px;
            border-top:2px solid #b8860b;
            border-bottom:2px solid #b8860b;
            font-family:Georgia, serif;
            color:#1e3a5f;
          ">
            <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase;">
              Status
            </div>
            <div style="font-size:25px; font-weight:bold; margin-top:3px;">
              Completed
            </div>
          </div>
        </div>

        <div style="
          margin-top:42px;
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          font-family:Georgia, serif;
        ">
          <div style="width:260px; text-align:center;">
            <div style="height:2px; background:#1e3a5f; margin-bottom:9px;"></div>
            <div style="font-size:15px; color:#1e3a5f; font-weight:bold;">
              Flowchart Pintar
            </div>
            <div style="font-size:12px; color:#64748b; margin-top:3px;">
              Learning Platform
            </div>
          </div>

          <div style="
            color:#64748b;
            font-size:12px;
            letter-spacing:1px;
            text-transform:uppercase;
          ">
            Certificate No. ${certificateNumber}
          </div>

          <div style="width:260px; text-align:center;">
            <div style="height:2px; background:#1e3a5f; margin-bottom:9px;"></div>
            <div style="font-size:15px; color:#1e3a5f; font-weight:bold;">
              ${tanggal}
            </div>
            <div style="font-size:12px; color:#64748b; margin-top:3px;">
              Date of Issue
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(certificate);

  const canvas = await html2canvas(certificate, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#f8f1df",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("landscape", "pt", "a4");
  pdf.addImage(imgData, "PNG", 0, 0, 842, 595);
  pdf.save(`Sertifikat-${course.title}.pdf`);

  document.body.removeChild(certificate);
};
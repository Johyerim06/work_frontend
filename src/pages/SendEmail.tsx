import { useState, useRef } from "react";
import axios from "axios";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

interface EmailForm {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
}

export default function SendEmail() {
  const [email, setEmail] = useState<EmailForm>({ to: "", cc: "", bcc: "", subject: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>("");
  const editorRef = useRef<Editor>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail({ ...email, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleSend = async () => {
    try {
      const formData = new FormData();
      formData.append("to", email.to);
      if (email.cc) formData.append("cc", email.cc);
      if (email.bcc) formData.append("bcc", email.bcc);
      formData.append("subject", email.subject);

      const editorInstance = editorRef.current;
      if (editorInstance) {
        const htmlContent = editorInstance.getInstance().getHTML();
        formData.append("body", htmlContent);
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await axios.post(
        "http://localhost:8080/api/sendMail",
        formData,
        { withCredentials: true }
      );
      console.log(res);
      setMessage("메일 전송 완료!");
    } catch (err) {
      console.error(err);
      setMessage("메일 전송 실패");
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/microsoft";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedSchool(null);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(async () => {
      if (query.trim() === "") {
        setSchoolResults([]);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8080/api/schools?name=${encodeURIComponent(query)}`);
        const parsedData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        const schoolList = parsedData.schoolInfo?.[1]?.row || [];
        setSchoolResults(schoolList);
      } catch (error) {
        console.error("학교 검색 중 오류:", error);
        setSchoolResults([]);
      }
    }, 300);

    setTypingTimeout(timeout);
  };

  const handleSelectSchool = (school: any) => {
    setSelectedSchool(school);
    setSearchQuery(school.SCHUL_NM);
    setSchoolResults([]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* ✨ 학교 검색 영역 */}
      <div className="p-6 mb-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">학교 검색</h2>

        {/* ✨ 입력창 + 팝업 묶기 */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="학교 이름 입력 (예: 덕인)"
            className="border p-2 w-full"
          />

          {/* ✨ 팝업 띄우기 */}
          {searchQuery.trim() !== "" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "#ffffff", // 흰색
                color: "#000000", // 검정색 글자
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 100,
                marginTop: "4px",
                overflowY: "auto",
                maxHeight: "240px"
              }}
            >
              {schoolResults.length > 0 ? (
                schoolResults.map((school, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectSchool(school)}
                  >
                    <div className="font-semibold">{school.SCHUL_NM}</div>
                    <div className="text-sm text-gray-500">{school.LCTN_SC_NM}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-center">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 선택된 학교 출력 */}
        {selectedSchool && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <div><strong>학교명:</strong> {selectedSchool.SCHUL_NM}</div>
            <div><strong>주소:</strong> {selectedSchool.ORG_RDNMA}</div>
          </div>
        )}
      </div>

      {/* ✨ 메일 보내기 영역 */}
      <h2 className="text-3xl font-bold mb-6">Microsoft 메일 보내기</h2>

      <div className="mb-4">
        <label className="font-semibold">받는 사람 (To):</label>
        <input name="to" value={email.to} onChange={handleChange} className="border p-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="font-semibold">참조 (Cc):</label>
        <input name="cc" value={email.cc} onChange={handleChange} className="border p-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="font-semibold">숨은 참조 (Bcc):</label>
        <input name="bcc" value={email.bcc} onChange={handleChange} className="border p-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="font-semibold">제목:</label>
        <input name="subject" value={email.subject} onChange={handleChange} className="border p-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="font-semibold">내용:</label>
        <Editor
          ref={editorRef}
          initialValue=""
          previewStyle="vertical"
          height="400px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          hideModeSwitch={true}
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">파일 첨부:</label>
        <input type="file" multiple onChange={handleFileChange} className="border p-2 w-full" />
        {files.length > 0 && (
          <ul className="mt-2 list-disc list-inside">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex space-x-4">
        <button onClick={handleSend} className="bg-blue-600 text-white px-6 py-2 rounded">
          메일 보내기
        </button>

        <button onClick={handleLogin} className="bg-gray-700 text-white px-6 py-2 rounded">
          Microsoft 로그인
        </button>
      </div>

      <p className="mt-4 text-green-600">{message}</p>
    </div>
  );
}

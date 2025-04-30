// SendEmail.tsx

import React from 'react';
import axios from 'axios';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

interface EmailForm {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
}

interface SendEmailProps {
  selectedSchool: any; // 선택된 학교 정보를 받아옴
}

interface SendEmailState {
  email: EmailForm;
  files: File[];
  message: string;
}

class SendEmail extends React.Component<SendEmailProps, SendEmailState> {
  editorRef = React.createRef<Editor>();

  state: SendEmailState = {
    email: { to: '', cc: '', bcc: '', subject: '' },
    files: [],
    message: '',
  };

  handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      email: {
        ...this.state.email,
        [e.target.name]: e.target.value,
      },
    });
  };

  handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      this.setState((prevState) => ({
        files: [...prevState.files, ...selectedFiles],
      }));
    }
  };

  handleSendEmail = async () => {
    try {
      const formData = new FormData();
      const { email, files } = this.state;

      formData.append('to', email.to);
      if (email.cc) formData.append('cc', email.cc);
      if (email.bcc) formData.append('bcc', email.bcc);
      formData.append('subject', email.subject);

      const editorInstance = this.editorRef.current;
      if (editorInstance) {
        const htmlContent = editorInstance.getInstance().getHTML();
        formData.append('body', htmlContent);
      }

      files.forEach((file) => {
        formData.append('files', file);
      });

      await axios.post('http://localhost:8080/api/sendMail', formData, { withCredentials: true });
      this.setState({ message: '메일 전송 완료!' });
    } catch (err) {
      console.error(err);
      this.setState({ message: '메일 전송 실패' });
    }
  };

  handleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/microsoft';
  };

  render() {
    const { selectedSchool } = this.props;
    const { email, files, message } = this.state;

    return (
      <section className="p-6 mb-8 bg-white rounded shadow">

        {/* 메일 작성 */}
        <h2 className="text-3xl font-bold mb-6">메일 보내기</h2>

        <div className="mb-4">
          <label>받는 사람 (To):</label>
          <input name="to" value={email.to} onChange={this.handleEmailChange} className="border p-2 w-full" />
        </div>

        <div className="mb-4">
          <label>참조 (Cc):</label>
          <input name="cc" value={email.cc} onChange={this.handleEmailChange} className="border p-2 w-full" />
        </div>

        <div className="mb-4">
          <label>숨은 참조 (Bcc):</label>
          <input name="bcc" value={email.bcc} onChange={this.handleEmailChange} className="border p-2 w-full" />
        </div>

        <div className="mb-4">
          <label>제목:</label>
          <input name="subject" value={email.subject} onChange={this.handleEmailChange} className="border p-2 w-full" />
        </div>

        <div className="mb-4">
          <label>내용:</label>
          <Editor
            ref={this.editorRef}
            initialValue=""
            previewStyle="vertical"
            height="400px"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
            hideModeSwitch={true}
          />
        </div>

        <div className="mb-4">
          <label>파일 첨부:</label>
          <input type="file" multiple onChange={this.handleFileChange} className="border p-2 w-full" />
          {files.length > 0 && (
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex space-x-4">
          <button onClick={this.handleSendEmail} className="bg-blue-600 text-white px-6 py-2 rounded">
            메일 보내기
          </button>
          <button onClick={this.handleLogin} className="bg-gray-700 text-white px-6 py-2 rounded">
            Microsoft 로그인
          </button>
        </div>

        <p className="mt-4 text-green-600">{message}</p>
      </section>
    );
  }
}

export default SendEmail;

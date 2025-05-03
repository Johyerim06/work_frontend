// Home.tsx

import React from 'react';
import SearchSchool from './SearchSchool'; // 위에서 만든거
import SendEmail from './SendEmail'; // 위에서 만든거
// import './Home.css'; // 필요하면 사용
import FileUpload from '../component/FileUpload';

interface HomeState {
  selectedSchool: any | null;
}

class Home extends React.Component<{}, HomeState> {
  state: HomeState = {
    selectedSchool: null,
  };

  handleSelectSchool = (school: any) => {
    this.setState({ selectedSchool: school });
  };

  render() {
    const { selectedSchool } = this.state;

    return (
      <div className="container">
        {/* 학교 검색 부분 */}
        <SearchSchool onSelectSchool={this.handleSelectSchool} />

        {/* 메일 보내기 부분 */}
        <SendEmail selectedSchool={selectedSchool} />

        {/* 파일 업로드 영역 */}
        <FileUpload />
      </div>
    );
  }
}

export default Home;

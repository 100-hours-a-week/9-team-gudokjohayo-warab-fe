import React from 'react';
import { MessageSquare, Tag, CheckCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const FeaturesPage = () => {
  const navigate = useNavigate();

  const handleCategoryRegister = () => {
    navigate("/profile"); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Wara :B</h1>
        {/* <button className="text-sm text-orange-500 font-medium">
          시작하기 <ArrowRight className="inline-block w-4 h-4 ml-1" />
        </button> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h2>
          {/* <p className="text-gray-600">Wara :B 사용 가이드예요.</p> */}
        </div>

        {/* Features Section */}
        <div className="space-y-6">
          {/* Comment Feature */}
          <div className="bg-orange-50 rounded-xl p-6">
            <div className="flex items-start mb-4">
              <div className="bg-orange-500 rounded-full p-2 mr-4">
                <MessageSquare className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">댓글 기능</h3>
                <p className="text-gray-600 text-sm">
                  다른 게이머들과 소통하고 함께 게임을 즐겨보세요
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <CheckCircle className="text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  디스코드 초대 링크를 등록하고 게임 상세 페이지에서 댓글을 남겨보세요
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  댓글에 있는 디스코드 아이콘을 클릭하면 해당 사용자의 디스코드 채널 링크가 복사돼요
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-orange-500 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  프로필 페이지에서 언제든지 디스코드 초대 링크를 관리할 수 있어요
                </p>
              </div>
            </div>
          </div>

          {/* Category Feature */}
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-start mb-4">
              <div className="bg-blue-500 rounded-full p-2 mr-4">
                <Tag className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">선호 카테고리 기능</h3>
                <p className="text-gray-600 text-sm">
                  내 취향에 맞는 게임을 추천받아보세요
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <CheckCircle className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  프로필 페이지에서 선호하는 게임 카테고리를 선택해보세요
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  선택한 카테고리를 기반으로 맞춤형 게임 추천을 받을 수 있어요
                </p>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-blue-500 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  언제든지 선호 카테고리를 변경하여 다양한 게임을 발견해보세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Setup Button */}
        <div className="mt-8">
          <button onClick={handleCategoryRegister} 
          className="w-full bg-orange-500 text-white font-medium py-3 rounded-full shadow-sm hover:bg-orange-600 transition-colors">
            프로필 설정하기
          </button>
        </div>
      </div>

      {/* Bottom Navigation/Info */}
      <div className="p-6 text-center">
        {/* <p className="text-sm text-gray-500">
          문의사항이 있으신가요? <a href="#" className="text-orange-500 font-medium">고객센터</a>로 연락주세요
        </p> */}
      </div>
    </div>
  );
};

export default FeaturesPage;

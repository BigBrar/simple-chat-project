import React from 'react';

const AllChats = ({ users, accessUserChat, currentChat }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm h-full transition-colors duration-200 ease-in-out">
  <h2 className="text-xl font-semibold text-gray-800 mb-4 px-2 text-center font-extralight">Your Chats</h2>
  <div className="space-y-2">
    {users.map((user) => (
      <div
        key={user}
        onClick={() => accessUserChat(user)}
        className={`
          transform transition-all duration-300 ease-in-out
          cursor-pointer rounded-lg p-3
          hover:bg-gray-100 hover:scale-[1.02]
          ${user === currentChat 
            ? 'bg-blue-100 shadow-md translate-x-1' 
            : 'bg-white hover:translate-x-1'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${user === currentChat 
                ? 'bg-blue-500 text-white scale-110' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }
            `}>
              {user.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`
              text-sm font-medium truncate
              transition-all duration-300 ease-in-out
              ${user === currentChat 
                ? 'text-blue-900 scale-105' 
                : 'text-gray-900'
              }
            `}>
              {user}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
  );
};

export default AllChats;
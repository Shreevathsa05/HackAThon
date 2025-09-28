import React from "react";

const TeamCard = ({ member }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 w-full max-w-sm mx-auto border border-gray-100 flex flex-col items-center p-6">
      {/* Profile Image */}
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full overflow-hidden shadow-md ring-4 
    ${member.lead ? "ring-blue-200" : member.mentor ? "ring-purple-200" : "ring-emerald-200"}`}
        >
          <img
            src={member.profile}
            alt={member.name}
            className="w-full h-full object-cover scale-90 rounded-full"
          />
        </div>


        {member.lead && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            Lead
          </span>
        )}
        {member.mentor && (
          <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            Mentor
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-center">
        <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
        <p
          className={`font-semibold mb-4 text-sm ${member.lead
            ? "text-blue-600"
            : member.mentor
              ? "text-purple-600"
              : "text-emerald-600"
            }`}
        >
          {member.role}
        </p>

        {/* Links */}
        <div className="flex justify-center gap-2">
          <a
            href={member.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium text-sm px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;

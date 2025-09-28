import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { api } from "../../api/api";
import extractErrorMsg from "../../utils/extractErrorMsg";

export default function SkillProfile({ examId }) {
  const [skillProfile, setSkillProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  console.log(skillProfile)
  useEffect(() => {
    const fetchSkillProfile = async () => {
      setLoading(true);
      setErrMsg("");
      try {
        const res = await api.get(`/teacher/skills/${examId}`);
        setSkillProfile(res.data.data);
      } catch (error) {
        setErrMsg(extractErrorMsg(error));
        console.error("Skill Profile :: error :: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchSkillProfile();
  }, [examId]);

  // Convert skill_profile object to array for recharts
  const skillData = Object.keys(skillProfile).map(skill => ({
    skill,
    easy: skillProfile[skill]?.easy || 0,
    medium: skillProfile[skill]?.medium || 0,
    hard: skillProfile[skill]?.hard || 0,
  }));

  if (loading) return <p>Loading Skill Profile...</p>;
  if (errMsg) return <p className="text-red-500">{errMsg}</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Skill Profile</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={skillData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="skill" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="easy" fill="#4ade80" />
          <Bar dataKey="medium" fill="#60a5fa" />
          <Bar dataKey="hard" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

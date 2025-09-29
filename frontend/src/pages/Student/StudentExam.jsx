import React from 'react'
import { useParams } from "react-router-dom";

function StudentExam() {
    const { examId } = useParams();
    
    return (
        <div>StudentExam</div>
    )
}

export default StudentExam
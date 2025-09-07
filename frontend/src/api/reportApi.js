import api from "./axios";


export const downloadStudentReport = async (examId, studentId) => {
  const res = await api.get(`/reports/student/${examId}/${studentId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Student_Report.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadClassReports = async (examId, classLevel) => {
  const res = await api.get(`/reports/class/${examId}/${classLevel}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${classLevel}_Reports.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

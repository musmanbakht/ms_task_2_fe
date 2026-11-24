import LoadingSkeleton from "../components/Common/LoadingSkeleton";
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
// import HeaderStats from "../components/Headers/HeaderStats";
import { dashboardStats, fetchDepartments } from "../API";
import PublicationBarChart from "../components/Charts/Dashboard/PublicationBarChart";
import PublicationLineChart from "../components/Charts/Dashboard/PublicationLineChart";
import SchoolsPieChart from "../components/Charts/Dashboard/SchoolsPieChart";
// import MapDashboard from "../components/Maps/MapDashboard";
import DashboardMap from "../components/Maps/DashboardMap";
import PublicationsWordChart from "../components/Charts/Dashboard/PublicationsWordChart";
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState([]);
  const [highlightSchool, setHighlightSchool] = useState(null); // ✅ new state
  const [selectedYear, setSelectedYear] = useState(null); // ✅

  // API CALL FOR DHASHBOARD
  useEffect(() => {
    const getDashboardData = async (year) => {
      try {
        setLoading(true);
        // year = new Date().getFullYear();
        // const response = await dashboardStats();
        const [res1, res2] = await Promise.all([
          dashboardStats(year),
          fetchDepartments(),
        ]);
        console.log("RES !", res1);
        setDashboardData(res1.data || null);
        setDepartmentData(res2.allSchools || []);
      } catch (err) {
        console.log("Failed to fetch Data:", err);
      } finally {
        setLoading(false);
      }
    };
    getDashboardData(selectedYear);
  }, [selectedYear]);
  console.log("IN DASH", ">>>>>>>>>>>>", dashboardData.allSchoolsYearly);
  return (
    <>
      <div>
        <div className="p-4">
          {loading && <LoadingSkeleton text="Loading publications and charts…" className="h-48 mb-4" />} 
          <DashboardMap
            schools={dashboardData ? dashboardData.allSchoolsYearly : []}
            onSchoolSelect={(name) => setHighlightSchool(name)}
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(year)}
          />
          <div className="flex flex-wrap">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 pl-4">
              {!loading && (
                <PublicationLineChart
                  publicationCountPerMonth={
                    dashboardData ? dashboardData?.publicationCountPerMonth : []
                  }
                />
              )}
            </div>
            <div className="w-full xl:w-4/12 px-4">
              {!loading && departmentData && (
                <PublicationBarChart
                  allDepartments={departmentData}
                  highlightDepartment={
                    highlightSchool || "School of Mining Engineering"
                  }
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-[300px] h-[300px] xl:w-4/12 mb-12 xl:mb-0 pl-4">
              {!loading && (
                <SchoolsPieChart
                  data={dashboardData.allSchoolsYearly}
                  totalPublications={dashboardData.publicationCount || 1}
                />
              )}
            </div>
            <div className="w-full xl:w-8/12 px-4">
              {!loading && departmentData && (
                <PublicationsWordChart
                  data={
                    dashboardData ? dashboardData.publicationWordCounts : []
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <CardLineChart />
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <CardBarChart />
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Dashboard;

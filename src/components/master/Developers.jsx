import { BsLinkedin, BsGithub, BsPersonBadge, BsCodeSquare, BsPeopleFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import logo from "../../assets/image/general/logo.png";
import { useContext, useEffect, useState } from "react";
import { MainContext } from "../../context/Context";

const roleBadgeColor = (role) => {
  if (role.toLowerCase().includes("leader")) return "danger";
  if (role.toLowerCase().includes("frontend")) return "success";
  if (role.toLowerCase().includes("testing") || role.toLowerCase().includes("integration")) return "info";
  return "secondary";
};

const Developers = () => {
  const { fetchTeamMembers } = useContext(MainContext);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await fetchTeamMembers();
        setTeamMembers(data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    }
    loadTeam();
  }, [fetchTeamMembers]);

  return (
    <>
      {/* Header */}
      <div className="container-fluid bg-light border-bottom">
        <header className="container d-flex justify-content-between align-items-center px-md-0">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Logo" height="60" className="me-2" />
          </div>
          <nav>
            <Link to="/" className="btn btn-danger rounded-0 btn-sm d-inline-flex align-items-center">
              <i className="bi bi-house-door-fill me-2"></i>
              Home</Link>
          </nav>
        </header>
      </div>

      {/* Main Content */}
      <section className="container py-5">
        <h2 className="mb-4 d-flex justify-content-center align-items-center gap-2 f6 fw-semibold">
          <BsPeopleFill className="text-primary" />
          Our Team
        </h2>
        <hr />
        <div className="row justify-content-center mt-md-5">
          {teamMembers.map((member) => (
            <div key={member.id} className="col-md-3 mb-4">
              <div className={`card shadow-sm h-100`}>

                {/* Image with fixed aspect ratio + zoom hover */}
                <div className="overflow-hidden" style={{ width: "100%", aspectRatio: "4 / 3" }}>
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="card-img-top team-img"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                      transition: "transform 0.4s ease",
                    }}
                  />
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title d-flex align-items-center">
                    {member.name}
                    {member.is_leader && <span className="badge bg-primary ms-2">Leader</span>}
                  </h5>
                  <span
                    className={`badge bg-${roleBadgeColor(member.role)} mb-2`}
                    style={{ fontSize: "0.85rem" }}
                    title={member.role}
                  >
                    <BsPersonBadge className="me-1" />
                    {member.role}
                  </span>
                  <p className="card-text mb-1">
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${member.email}`}>{member.email}</a>
                  </p>
                  <p className="card-text">
                    <strong>Mobile:</strong>
                    <a href={`tel:${member.mobile}`} className="ms-2 text-decoration-none cl4">{member.mobile}</a>
                  </p>

                  <div className="mt-auto mb-3 d-flex flex-wrap gap-2 bg-light p-3 rounded rounded-2">
                    {member.skills.map((skill, index) => (
                      <span key={index} className="badge bg-secondary">
                        <BsCodeSquare className="me-1" />
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="d-flex justify-content-start align-items-center mt-auto">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="me-3 text-decoration-none"
                      title="LinkedIn"
                    >
                      <BsLinkedin style={{ fontSize: "1.6rem", color: "#0A66C2" }} />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      className="text-decoration-none cl4"
                    >
                      <BsGithub style={{ fontSize: "1.6rem" }} />
                    </a>
                  </div>
                </div>

                {/* animated bottom line */}
                <div className={`card-bottom-line bg-${roleBadgeColor(member.role)}`}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center position-fixed bottom-0 w-100 bg-light py-3 border-top">
        <small>© {new Date().getFullYear()} SmartDine Team. All rights reserved.</small>
      </footer>
    </>
  );
};

export default Developers;
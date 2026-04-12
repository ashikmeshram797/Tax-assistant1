import "./UserView.css";

const users = [
  { id: 1, name: "Samir Mule", email: "samir@gmail.com", role: "Admin" },
  { id: 2, name: "Ashik Meshram", email: "ashikmeshram797@gmail.com", role: "Admin" },
  { id: 3, name: "Priya Patel", email: "priya@gmail.com", role: "User" },
  { id: 4, name: "Rahul Verma", email: "rahul@gmail.com", role: "Moderator" },
];

function UserView() {
  return (
    <div className="user-page">
      <h2>User Management</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <button className="view-btn">View</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserView;
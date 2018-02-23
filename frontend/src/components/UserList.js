import React from 'react';

const UserList = ({ users, over, onClick }) => (
  users.filter(user => user.count > over).map(user => (
    <li key={user.name}>
      <a href={`#${user.name}`} name={user.name} onClick={onClick}>
        {user.name}: {user.count}
      </a>
    </li>
  ))
);

export default UserList;

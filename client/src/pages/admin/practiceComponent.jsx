import {gql} from "@apollo/client";
import { useQuery} from "@apollo/client/react";

//GET ALL THE USERS
  const GET_DEPARTMENTS = gql`
    query Departments {
      departments {
        id
        name
        users {
          id
          fullname
          position
        }
      }
    }
  `;
function PracticeComponent() {
  const { loading, error, data } = useQuery(GET_DEPARTMENTS);

  if (loading) return <p>loading....</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data?.departments?.map((def) => (
        <div key={def.id}>
          <p>{def.name}</p>
          {def.users?.map((user) => (
            <p key={user.id}>
              {user.id} : {user.fullname} : {user.position}
            </p>
          ))}
          <div className="w-full h-4 bg-amber-300"></div>
        </div>
      ))}
    </div>
  );
}
export default PracticeComponent;
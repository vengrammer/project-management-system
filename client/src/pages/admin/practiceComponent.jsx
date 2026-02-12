import {gql} from "@apollo/client";
import { useQuery} from "@apollo/client/react";

//GET ALL THE USERS
  const GET_USERS = gql`
    query Users {
      departments {
        id
        isActive
        name
        updatedAt
        description
        createdAt
        users {
          id
        }
      }
    }
  `;
function PracticeComponent() {
  const {loading, error, data} = useQuery(GET_USERS);
  if(loading) return <p>loading....</p>
  if(error) return <p>Error: {error.message}</p>
 return (
   <div>
     {data?.departments?.map((dept) => (
       <div key={dept.id}>
         <p>{dept.isActive ? "Active" : "Inactive"}</p>
         <p>{dept.name}</p>
         <p>{dept.updatedAt}</p>
         <p>{dept.description}</p>
         <p>{dept.createdAt}</p>

         <p>Total Users: {dept.users?.length || 0}</p>

         <div className="w-full h-4 bg-amber-300"></div>
       </div>
     ))}
   </div>
 );

}
export default PracticeComponent;
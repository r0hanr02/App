import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useStore } from "../../../../store/store";

const Home = () => {
  const { activeOrg } = useActiveOrg();
  console.log(activeOrg);
  // const orgData = useStore((s)=>s.)
  return <div>Home</div>;
};

export default Home;

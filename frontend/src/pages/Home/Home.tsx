import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div>
      Home Page
      <div className="text-foreground flex flex-col items-center ">
        <img
          src="/src/assets/organization-empty-state.svg"
          className="w-72 h-72 object-top-left"
          alt="Empty Org"
        />
        <div
          className="flex flex-col items-center gap-2
      "
        >
          <h2 className="text-lg">No Organization Found</h2>
          <p className="text-muted-foreground text-center m-0 line-clamp-2 leading-5">
            Create organization to begin with your <br /> project handling
            seamlessly{" "}
          </p>
          <Button>Create Organization</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
 
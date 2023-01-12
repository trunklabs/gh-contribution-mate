export const nameSetup = (
  userName,
  userEmail,
  isFileCreated,
  next,
) => {
  if (!userName || !userEmail) {
    console.log(
      "Probably you don't have git installed or configured on your machine. \nPlease install git or configure it at first then try again.",
    );
    return Deno.exit(1);
  }

  if (isFileCreated) {
    console.log(
      "You have previously configured Contribution Mate. You can update the current configuration",
    );
    return next();
  }
  console.log("Lets setup your credentials at first");
  return next();
};

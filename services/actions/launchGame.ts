export const launchGame = async (payload: any) => {
  const queryString = new URLSearchParams(payload).toString();
  // console.log(payload, queryString);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/launchGame?${queryString}`
  );

  return await res.json();
};
export const index = async function (event) {
  try {
    const now = new Date(Date.now()).toString();
    console.log(now);

    return {
      statusCode: 200,
      body: now,
    };
  } catch (e) {
    console.error(e);
  }
};

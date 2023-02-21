import SendGrid from "./mail";

export async function email(to: string, content: string) {
  try {
    // @ts-ignore
    const sendGrid = await SendGrid.send({ to, content });
    console.log(sendGrid);
  } catch (error) {
    console.log(error);
  }
}

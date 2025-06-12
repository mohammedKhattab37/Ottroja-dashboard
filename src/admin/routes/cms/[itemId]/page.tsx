import { Container, Heading } from "@medusajs/ui";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";

export type CMSItem = {
  id: string;
  name: string;
  title: string | null;
  content: string | null;
  items: Array<{
    title: string;
    url?: string;
  }> | null;
  updated_at: Date;
};

const CMSItemPage = () => {
  const { itemId } = useParams();

  const { data, isLoading } = useQuery<{
    cms_item: CMSItem;
  }>({
    queryKey: ["cms-item"],
    queryFn: () =>
      sdk.client.fetch(`/admin/cms/${itemId}`, {
        method: "GET",
      }),
  });

  return (
    <div className="flex w-full flex-col gap-y-3">
      <Container className="divide-y">
        <Heading level="h2">{data?.cms_item.name}</Heading>
      </Container>
      <Container className="divide-y">
        <Heading level="h2">Content</Heading>
        <div>{data?.cms_item.content}</div> //make it show preview
      </Container>
      <Container className="divide-y">
        <Heading level="h2">Images</Heading>
        <div></div> //make it show images preview
      </Container>
      <Container className="divide-y">
        <Heading level="h2">Items</Heading>
        <div className="py-4">
          {data?.cms_item.items?.map((item) => (
            <div className="grid gap-x-2">
              <span>{item.title}</span>
              <a
                href={
                  item.url?.startsWith("http")
                    ? item.url
                    : `https://${item.url}`
                }
                target="_blank"
                className="ps-2 text-sm underline underline-offset-3 text-sky-500"
              >
                {item.url}
              </a>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default CMSItemPage;

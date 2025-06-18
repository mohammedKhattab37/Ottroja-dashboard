import { Container, Divider, Heading, IconButton, Text } from "@medusajs/ui";
import { ArrowUpRightOnBox } from "@medusajs/icons";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";
import "../../../@/styles/tiptap-extensions-styles.scss";
import { UpdateCMSItemForm } from "../../../components/update-cms-item-form";
import { useState } from "react";

export type CMSItem = {
  id: string;
  name: string;
  title: string | null;
  eng_content: string | null;
  ar_content: string | null;
  items: {
    [key: string]: {
      title: string;
      url?: string;
    };
  };
  images: string[];
  updated_at: Date;
};

const CMSItemPage = () => {
  const { itemId } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    cms_item: CMSItem;
  }>({
    queryKey: ["cms-item"],
    staleTime: 0,
    queryFn: () =>
      sdk.client.fetch(`/admin/cms/${itemId}`, {
        method: "GET",
      }),
  });

  return (
    <div className="flex w-full flex-col gap-y-3">
      <Container className="divide-y">
        <Heading level="h1" className="py-4 flex justify-between">
          {data?.cms_item.name}
          <IconButton type="button" onClick={() => setOpenModal(true)}>
            <ArrowUpRightOnBox />
          </IconButton>
        </Heading>
        <div
          className={
            "text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4"
          }
        >
          <Text size="small" weight="plus" leading="compact">
            Title
          </Text>
          <Text
            size="small"
            leading="compact"
            className="whitespace-pre-line text-pretty"
          >
            {data?.cms_item.title || "-"}
          </Text>
        </div>
      </Container>
      <Container className="divide-y">
        <Heading level="h1" className="py-4">
          English Content
        </Heading>
        {data?.cms_item.eng_content && (
          <div
            className="p-4 tiptap bg-black/20"
            dangerouslySetInnerHTML={{ __html: data?.cms_item.eng_content }}
          ></div>
        )}
      </Container>
      <Container className="divide-y">
        <Heading level="h1" className="py-4">
          Arabic Content
        </Heading>
        {data?.cms_item.ar_content && (
          <div
            className="p-4 tiptap bg-black/20"
            dangerouslySetInnerHTML={{ __html: data?.cms_item.ar_content }}
          ></div>
        )}
      </Container>
      <Container>
        <Heading level="h1" className="py-4">
          Images
        </Heading>
        {data?.cms_item.images && (
          <>
            <Divider />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {data?.cms_item.images.map((image) => (
                <img
                  src={image.split("||")[0]}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </>
        )}
      </Container>
      <Container>
        <Heading level="h1" className="py-4">
          Items
        </Heading>
        <div className="py-4">
          {Object.values(data?.cms_item.items || {}).map((item, i) => (
            <div className="gap-y-2" key={i}>
              <span>- {item.title}</span>
              {item.url && (
                <a
                  href={
                    item.url?.startsWith("http")
                      ? item.url
                      : `https://${item.url}`
                  }
                  target="_blank"
                  className="ps-2 text-sm underline underline-offset-3 text-sky-500"
                >
                  ({item.url})
                </a>
              )}
            </div>
          ))}
        </div>
        {data?.cms_item && (
          <UpdateCMSItemForm
            isOpen={openModal}
            onOpenChange={setOpenModal}
            initialItemData={data?.cms_item}
            refetch={() =>
              queryClient.invalidateQueries({ queryKey: ["cms-item"] })
            }
          />
        )}
      </Container>
    </div>
  );
};

export default CMSItemPage;

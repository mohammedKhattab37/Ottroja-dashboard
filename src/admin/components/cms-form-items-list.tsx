import { Label, Input, Button } from "@medusajs/ui";
import OptionalFormTag from "./optional-form-tag";

type CMSItemsProps = {
  item: {
    title: string;
    url?: string | undefined;
  };
  index: number;
  setItems: React.Dispatch<
    React.SetStateAction<{
      [key: string]: { title: string; url?: string | undefined };
    }>
  >;
};

export const CMSFormItemsList = ({ item, index, setItems }: CMSItemsProps) => (
  <div className="grid gap-y-2 px-4 py-2">
    <div>
      <Label size="small" weight="plus">
        Title
      </Label>
      <Input
        type="text"
        placeholder="Title"
        className="w-full mt-1 rounded-md p-2"
        value={item.title}
        onChange={(e) =>
          setItems((items) => {
            const newItems = { ...items };
            const keys = Object.keys(items);
            keys[index] &&
              (newItems[keys[index]] = {
                url: items[keys[index]].url,
                title: e.target.value,
              });
            return newItems;
          })
        }
      />
    </div>
    <div className="flex items-end justify-between">
      <div className="w-[75%]">
        <div className="flex gap-x-1">
          <Label size="small" weight="plus">
            URL
          </Label>
          <OptionalFormTag />
        </div>

        <Input
          type="text"
          placeholder="Url"
          className="w- mt-1 rounded-md p-2"
          value={item.url}
          onChange={(e) =>
            setItems((items) => {
              const newItems = { ...items };
              const keys = Object.keys(items);
              keys[index] &&
                (newItems[keys[index]] = {
                  title: items[keys[index]].title,
                  url: e.target.value,
                });
              return newItems;
            })
          }
        />
      </div>
      <Button
        variant="danger"
        type="button"
        className="w-fit h-fit"
        onClick={() =>
          setItems((items) => {
            const newItems = { ...items };
            const keys = Object.keys(items);
            delete newItems[keys[index]];
            return newItems;
          })
        }
      >
        Remove
      </Button>
    </div>
  </div>
);

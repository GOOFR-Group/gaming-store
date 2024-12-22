import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/lib/api";
import { TOAST_MESSAGES } from "@/lib/constants";
import { withAuthErrors } from "@/lib/middleware";
import { userQueryKey } from "@/lib/query-keys";
import { formatCurrency } from "@/lib/utils";

const amounts = [5, 10, 25, 50, 100];

const formSchema = z.object({
  amount: z.coerce.number({ message: "Select an amount" }),
});

type AddFundsSchemaType = z.infer<typeof formSchema>;

export function AddFunds(props: { id: string; balance: number }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<AddFundsSchemaType>({
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast();
  const mutation = useMutation({
    async mutationFn(data: AddFundsSchemaType) {
      await updateUser(props.id, {
        balance: props.balance + data.amount,
      });
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: userQueryKey });
      form.resetField("amount");
      setOpen(false);
    },
    onError: withAuthErrors(() => {
      toast(TOAST_MESSAGES.unexpectedError);
    }),
  });

  /**
   * Handles form submission.
   * @param data Form data.
   */
  function onSubmit(data: AddFundsSchemaType) {
    mutation.mutate(data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetField("amount");
        }
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button>Add Funds</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Your Account</DialogTitle>
          <DialogDescription>
            Select the amount you'd like to add to your account balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormControl>
                    <RadioGroup
                      className="grid gap-4"
                      defaultValue={String(field.value)}
                      onValueChange={field.onChange}
                    >
                      {amounts.map((amount) => {
                        const isSelected =
                          String(field.value) === String(amount);

                        return (
                          <FormItem key={amount}>
                            <FormControl>
                              <RadioGroupItem
                                className="peer sr-only"
                                value={String(amount)}
                              />
                            </FormControl>
                            <Button
                              asChild
                              className="w-full cursor-pointer"
                              variant={isSelected ? "default" : "secondary"}
                            >
                              <FormLabel className="font-normal">
                                {formatCurrency(amount)}
                              </FormLabel>
                            </Button>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={mutation.isPending} type="submit">
                Add Funds
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

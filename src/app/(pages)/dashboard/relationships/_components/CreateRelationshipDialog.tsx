"use client"

import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UsersIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CustomDialogHeader from '@/components/global/CustomDialogHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createRelationshipSchema, createRelationshipSchemaType } from '@/schema/relationship';

const relationshipBasisOptions = [
  { value: "ISLAMIC", label: "Islamic" },
  { value: "CHRISTIAN", label: "Christian" },
  { value: "BUDDHIST", label: "Buddhist" },
  { value: "JEWISH", label: "Jewish" },
  { value: "SECULAR", label: "Secular" },
  { value: "INTERFAITH", label: "Interfaith" },
  { value: "OTHER", label: "Other" },
] as const;

type RelationshipResponse = {
  id: string;
  name: string;
  partner1Id: string;
  partner2Id: string | null;
  status: 'pending' | 'active' | 'declined';
  basis?: string;
};

function CreateRelationshipDialog({triggerText}: {triggerText?: string}) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const [showCustomBasis, setShowCustomBasis] = React.useState(false);

  const form = useForm<createRelationshipSchemaType>({
    resolver: zodResolver(createRelationshipSchema),
    defaultValues: {
      name: "",
      partnerEmail: "",
      basis: undefined,
      customBasis: "",
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: createRelationshipSchemaType) => {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create relationship');
      }
      
      return response.json() as Promise<RelationshipResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      toast.success("Invitation sent successfully!", { 
        description: "Your partner will receive an email invitation.",
      });
      toast.dismiss("create-relationship");
      setOpen(false);
    },
    onError: (error: Error) => {
      if (error.message.includes("already exists")) {
        toast.error("A relationship with this partner already exists");
      } else {
        toast.error("Failed to create relationship");
      }
      toast.dismiss("create-relationship");
    }
  });

  const onSubmit = useCallback((data: createRelationshipSchemaType) => {
    toast.loading("Creating relationship...", { id: "create-relationship" });
    mutate(data);
  }, [mutate]);

  return (
    <Dialog open={open} onOpenChange={() => {
      form.reset();
      setShowCustomBasis(false);
      setOpen(!open);
    }}>
      <DialogTrigger asChild>
        <Button>{triggerText ?? "Create Relationship"}</Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={UsersIcon}
          title="Create a new relationship"
          subTitle="Invite your partner to connect"
        />
        <div className='p-6'>
          <Alert className="mb-6">
            <AlertDescription>
              Your partner will receive an email invitation to join. The relationship will be activated once they accept.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form className='space-y-6 w-full' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Relationship Name
                      <p className='text-xs text-primary'>(required)</p>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., John & Jane's Relationship"/>
                    </FormControl>
                    <FormDescription>
                      Give your relationship a meaningful name
                    </FormDescription>
                    <FormMessage />
                  </FormItem> 
                )}
              />

              <FormField 
                control={form.control}
                name="partnerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Partner's Email
                      <p className='text-xs text-primary'>(required)</p>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="partner@example.com"/>
                    </FormControl>
                    <FormDescription>
                      Enter your partner's email address to send them an invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem> 
                )}
              />

              <FormField
                control={form.control}
                name="basis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Religious/Spiritual Basis
                      <p className='text-xs text-primary'>(optional)</p>
                    
                      </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowCustomBasis(value === "OTHER");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a basis for your relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationshipBasisOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional: Select the religious or spiritual framework for your relationship
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomBasis && (
                <FormField 
                  control={form.control}
                  name="customBasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Basis Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Describe your relationship's spiritual/philosophical framework"/>
                      </FormControl>
                      <FormDescription>
                        Please describe your relationship's unique spiritual or philosophical framework
                      </FormDescription>
                      <FormMessage />
                    </FormItem> 
                  )}
                />
              )}

              <Button type="submit" className='w-full' disabled={isPending}>
                {!isPending && "Send Invitation"}
                {isPending && <Loader2 className='animate-spin'/>}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRelationshipDialog;
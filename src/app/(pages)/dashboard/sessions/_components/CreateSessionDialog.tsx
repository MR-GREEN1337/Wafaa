"use client"

import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Layers2Icon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { createSessionSchema, createSessionSchemaType } from '@/schema/session';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateSession } from '@/actions/sessions/createSession';
import CustomDialogHeader from '@/components/global/CustomDialogHeader';
import { useRouter } from 'next/navigation';

type Relationship = {
  id: string;
  name: string;
  partner1Id: string;
  partner2Id: string;
  status: string;
};

function CreateSessionDialog({triggerText}: {triggerText?: string}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<createSessionSchemaType>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: "",
      description: "",
      relationshipId: "",
      sessionType: "individual",
      status: "active"
    }
  });

  // Fetch user's relationships
  const { data: relationships } = useQuery({
    queryKey: ['relationships'],
    queryFn: async () => {
      const response = await fetch('/api/relationships');
      const data = await response.json();
      return data as Relationship[];
    }
  });

  const {mutate, isPending} = useMutation({
    mutationFn: CreateSession,
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success("Session created successfully", { id: "create-session" });
        setOpen(false);
        router.push(response.data.redirectUrl);
      } else {
        toast.error(response.error || "Failed to create session", { id: "create-session" });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create session", { id: "create-session" });
    }
  });

  const onSubmit = useCallback((data: createSessionSchemaType) => {
    toast.loading("Creating session...", { id: "create-session" });
    mutate(data);
  }, [mutate]);
  
  return (
    <Dialog open={open} onOpenChange={() => {
      form.reset();
      setOpen(!open);
    }}>
      <DialogTrigger asChild>
        <Button>{triggerText ?? "Create session"}</Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={Layers2Icon}
          title="Create a new session"
          subTitle="Start a new counseling session"
        />
        <div className='p-6'>
          <Form {...form}>
            <form className='space-y-6 w-full' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField 
                control={form.control}
                name="relationshipId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Relationship
                      <p className='text-xs text-primary'>(required)</p>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relationships?.map((relationship) => (
                          <SelectItem 
                            key={relationship.id} 
                            value={relationship.id}
                          >
                            {relationship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the relationship for this session
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField 
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Session Type
                      <p className='text-xs text-primary'>(required)</p>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="joint">Joint</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether this is an individual or joint session
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Name
                      <p className='text-xs text-primary'>(required)</p>
                    </FormLabel>
                    <FormControl>
                      <Input {...field}/>
                    </FormControl>
                    <FormDescription>
                      A unique name for your session
                    </FormDescription>
                    <FormMessage />
                  </FormItem> 
                )}
              />

              <FormField 
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex gap-1 items-center'>
                      Description
                      <p className='text-xs text-primary'>(Optional)</p>
                    </FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field}/>
                    </FormControl>
                    <FormDescription>
                      A description for your session
                    </FormDescription>
                    <FormMessage />
                  </FormItem> 
                )}
              />

              <Button type="submit" className='w-full' disabled={isPending}>
                {!isPending && "Create Session"}
                {isPending && <Loader2 className='animate-spin'/>}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSessionDialog;
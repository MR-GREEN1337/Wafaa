import { DeleteSession } from '@/actions/sessions/deleteSession'
import { AlertDialogContent,
    AlertDialogTitle,
    AlertDialogHeader,
    AlertDialogDescription,
    AlertDialog,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

type Props = {
  open: boolean,
  setOpen: (open: boolean) => void,
  sessionName: string,
  sessionId: string
}

function DeleteSessionDialog({open, setOpen, sessionName, sessionId}: Props) {
  const [confirmText, setConfirmText] = React.useState('')

  const deleteMutation = useMutation({
    mutationFn: DeleteSession,
    onSuccess: () => {
      toast.success('session deleted', {id: sessionId});
      setConfirmText('');
    },
    onError: (error) => {
      toast.error(error.message, {id: sessionId})
    }
  })
    return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your session and remove your data from our servers.
            <div className='flex flex-col py-4 gap-2'>
            <p>
                If you are sure, enter <b>{sessionName}</b> to confirm.
            </p>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            </div>
          </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                disabled={sessionName !== confirmText || deleteMutation.isPending}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                onClick={(e) => {
                    e.stopPropagation();
                    toast.loading("Deleting session", {id: sessionId});
                    deleteMutation.mutate(sessionId)
                }}
                >Delete</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteSessionDialog
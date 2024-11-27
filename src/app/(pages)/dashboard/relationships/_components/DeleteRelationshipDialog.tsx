import { DeleteRelationship } from '@/actions/relationships/deleteRelationship'
import {
    AlertDialogContent,
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
  relationshipName: string,
  relationshipId: string
}

function DeleteRelationshipDialog({open, setOpen, relationshipName, relationshipId}: Props) {
  const [confirmText, setConfirmText] = React.useState('')

  const deleteMutation = useMutation({
    mutationFn: DeleteRelationship,
    onSuccess: () => {
      toast.success('Relationship deleted successfully', { id: relationshipId });
      setConfirmText('');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message, { id: relationshipId });
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <div className="text-sm text-muted-foreground space-y-4">
            <AlertDialogDescription asChild>
              <span>
                This action is irreversible. Once deleted, this relationship and all associated data will be permanently removed from our servers. This includes:
              </span>
            </AlertDialogDescription>
            
            <ul className="list-disc pl-5">
              <li>All related sessions, including messages exchanged.</li>
              <li>Analyses tied to this relationship.</li>
              <li>Shared data, such as documents and files linked to this relationship.</li>
            </ul>
            
            <AlertDialogDescription asChild>
              <span>
                <strong>Important:</strong> Deletion cannot be undone. Ensure you've saved any critical information before proceeding.
              </span>
            </AlertDialogDescription>
            
            <div className="flex flex-col py-4 gap-2">
              <AlertDialogDescription asChild>
                <span>
                  To confirm, type <strong>{relationshipName}</strong> below.
                </span>
              </AlertDialogDescription>
              <Input 
                value={confirmText} 
                onChange={(e) => setConfirmText(e.target.value)} 
              />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            disabled={relationshipName !== confirmText || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.stopPropagation();
              toast.loading("Deleting relationship...", { id: relationshipId });
              deleteMutation.mutate(relationshipId);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteRelationshipDialog;